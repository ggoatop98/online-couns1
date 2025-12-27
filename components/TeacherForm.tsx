
import React, { useState, useEffect } from 'react';
import { useForm, useController, useWatch, Control } from 'react-hook-form';
import { 
  Send, ChevronLeft, GraduationCap, FileText, CheckSquare, 
  Activity, Brain, LayoutGrid, AlertCircle, Sparkles 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { TeacherFormData } from '../types';
import { PasswordModal } from './PasswordModal';
import { SuccessModal } from './SuccessModal';
import { ErrorModal } from './ErrorModal';
import { sendNotification } from '../services/notificationService';

// Shim for Controller since it's missing in the environment
const Controller = ({ control, name, render, rules }: any) => {
  const { field, fieldState } = useController({ control, name, rules });
  return render({ field, fieldState });
};

// --- Helper Components ---

interface SectionProps {
  title: string;
  icon: any;
  children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, icon: Icon, children }) => (
  <section className="bg-white p-6 md:p-8 rounded-3xl shadow-lg border border-purple-50 animate-fade-in-up">
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-100">
      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-8">
      {children}
    </div>
  </section>
);

const RadioGroup5 = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  // Removed '해당 없음'
  const options = ['매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
  return (
    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-50">
      <p className="font-bold text-slate-700 mb-4">{label}</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {options.map((opt) => (
          <label key={opt} className={`
            cursor-pointer px-1 py-3 md:px-2 rounded-xl text-sm font-medium transition-all text-center border flex items-center justify-center
            ${value === opt 
              ? 'bg-purple-500 text-white border-purple-500 shadow-md' 
              : 'bg-white text-slate-600 border-purple-100 hover:bg-purple-50'}
          `}>
            <input 
              type="radio" 
              className="hidden" 
              value={opt} 
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

const RadioGroup3 = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => {
  const options = ['양호함', '조금 심함', '매우 심함'];
  return (
    <div className="bg-purple-50/50 p-5 rounded-2xl border border-purple-50">
      <p className="font-bold text-slate-700 mb-4">{label}</p>
      <div className="flex gap-2">
        {options.map((opt) => (
          <label key={opt} className={`
            flex-1 cursor-pointer px-3 py-3 rounded-xl text-sm font-medium transition-all text-center border
            ${value === opt 
              ? 'bg-purple-500 text-white border-purple-500 shadow-md' 
              : 'bg-white text-slate-600 border-purple-100 hover:bg-purple-50'}
          `}>
            <input 
              type="radio" 
              className="hidden" 
              value={opt} 
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
};

// --- Main Component ---

export const TeacherForm: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(true);
  const [authError, setAuthError] = useState('');
  const [correctPassword, setCorrectPassword] = useState('2580'); // Default fallback
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  // Fetch password from Firebase on mount
  useEffect(() => {
    const fetchPassword = async () => {
      try {
        const docRef = doc(db, 'config', 'teacher_auth');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().password) {
          setCorrectPassword(docSnap.data().password);
        }
      } catch (error: any) {
        // Silently handle permission errors by keeping default password
        if (error.code !== 'permission-denied') {
           console.error("Error fetching teacher config:", error);
        }
      }
    };
    fetchPassword();
  }, []);

  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<TeacherFormData>({
    // [중요] 모든 필드에 대해 기본값을 설정해야 '두 번 클릭해야 제출되는 문제'가 해결됩니다.
    // 선택 항목들도 빈 문자열('')로 초기화합니다.
    defaultValues: {
      studentName: '',
      gradeClass: '',
      referralReason: '',
      desiredChange: '',
      
      strengths: '',
      favoriteActivities: '',
      
      peerRelation: '',
      classAttitude: '',
      learningAbility: '',
      compliance: '',
      
      inattention: '',
      impulsivity: '',
      aggression: '',
      behavioralExamples: '',
      
      emotions: [],
      otherEmotionDetail: '',
      repetitiveBehavior: 'no',
      repetitiveBehaviorDetail: '',
      frequency: '',
      severity: ''
    }
  });

  const selectedEmotions = watch('emotions');
  const repetitiveBehavior = watch('repetitiveBehavior');

  const handleAuthSubmit = (password: string) => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
      setShowAuthModal(false);
    } else {
      setAuthError('비밀번호가 일치하지 않습니다.');
    }
  };

  const handleAuthClose = () => {
    navigate('/');
  };

  const onSubmit = async (data: TeacherFormData) => {
    setIsSubmitting(true);
    try {
      const sanitizedData = {
        // 필수 항목 (Form Validation으로 체크됨)
        studentName: data.studentName,
        gradeClass: data.gradeClass,
        referralReason: data.referralReason,
        desiredChange: data.desiredChange,
        
        // 선택 항목 (값이 없으면 빈 문자열로 처리)
        strengths: data.strengths || '',
        favoriteActivities: data.favoriteActivities || '',
        
        // 척도 항목 (선택 안함 허용)
        peerRelation: data.peerRelation || '',
        classAttitude: data.classAttitude || '',
        learningAbility: data.learningAbility || '',
        compliance: data.compliance || '',
        
        // 행동 특성 (선택 안함 허용)
        inattention: data.inattention || '',
        impulsivity: data.impulsivity || '',
        aggression: data.aggression || '',
        behavioralExamples: data.behavioralExamples || '',
        
        // 정서 및 기타
        emotions: data.emotions || [],
        otherEmotionDetail: data.otherEmotionDetail || '',
        repetitiveBehavior: data.repetitiveBehavior || 'no',
        repetitiveBehaviorDetail: data.repetitiveBehaviorDetail || '',
        frequency: data.frequency || '',
        severity: data.severity || '',
        
        // 시스템 필드
        createdAt: serverTimestamp(),
        status: '접수대기'
      };

      await addDoc(collection(db, 'counseling_teacher'), sanitizedData);
      console.log("=== 교사 의뢰 데이터 저장 완료 ===");
      
      // 알림 전송 (데이터 저장 성공 후 실행됨)
      sendNotification('teacher', sanitizedData);

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const missing = [];
    if (errors.studentName) missing.push("학생 이름");
    if (errors.gradeClass) missing.push("학년/반");
    if (errors.referralReason) missing.push("의뢰 사유");
    if (errors.desiredChange) missing.push("기대하는 변화");
    
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50">
        <PasswordModal 
          isOpen={showAuthModal}
          onClose={handleAuthClose}
          onSubmit={handleAuthSubmit}
          errorMessage={authError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF] p-4 md:p-8 relative overflow-hidden flex justify-center">
      {/* Background Blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        message="상담 의뢰가 접수되었습니다."
        subMessage="선생님의 고민을 함께 나누겠습니다."
      />

      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        missingFields={missingFields}
      />

      <div className="w-full max-w-3xl z-10">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors bg-white/60 px-5 py-2.5 rounded-full backdrop-blur-sm font-medium shadow-sm hover:shadow-md">
            <ChevronLeft size={20} className="mr-1" />
            메인으로 돌아가기
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8 pb-20">
          
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in-down">
            <div className="inline-flex p-4 rounded-full bg-purple-100 text-purple-600 mb-4 shadow-sm">
              <GraduationCap size={40} strokeWidth={1.5} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">교사 상담 의뢰서</h1>
            <p className="text-slate-500 mt-3 text-lg">학생 지도에 대한 고민, 위클래스와 함께 나누세요.</p>
          </div>

          {/* Section A: Basic Info */}
          <Section title="기본 의뢰 정보" icon={FileText}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-slate-700 font-bold mb-2">학생 이름 <span className="text-red-400">*</span></label>
                <input 
                  {...register('studentName', { required: '학생 이름을 입력해주세요.' })}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 ${errors.studentName ? 'border-red-300' : 'border-purple-100 focus:border-purple-300'}`}
                  placeholder="예: 이학생"
                />
                 {errors.studentName && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/>{errors.studentName.message}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-2">학년 / 반 <span className="text-red-400">*</span></label>
                <input 
                  {...register('gradeClass', { required: '학년/반을 입력해주세요.' })}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 ${errors.gradeClass ? 'border-red-300' : 'border-purple-100 focus:border-purple-300'}`}
                  placeholder="예: 4학년 1반"
                />
                 {errors.gradeClass && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/>{errors.gradeClass.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-slate-700 font-bold mb-2">의뢰 사유 <span className="text-red-400">*</span></label>
              <textarea 
                {...register('referralReason', { required: '의뢰 사유를 입력해주세요.' })}
                className={`w-full px-4 py-4 rounded-xl bg-slate-50 border transition-all resize-none outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 ${errors.referralReason ? 'border-red-300' : 'border-purple-100 focus:border-purple-300'}`}
                rows={8}
                placeholder="상담을 의뢰하게 된 구체적인 이유와 관찰 내용을 적어주세요."
              />
              {errors.referralReason && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/>{errors.referralReason.message}</p>}
            </div>
            
            {/* Added Desired Change Input */}
            <div>
              <label className="block text-slate-700 font-bold mb-2">상담을 통해 기대하는 변화 <span className="text-red-400">*</span></label>
              <textarea 
                {...register('desiredChange', { required: '기대하는 변화를 입력해주세요.' })}
                className={`w-full px-4 py-4 rounded-xl bg-slate-50 border transition-all resize-none outline-none focus:bg-white focus:ring-2 focus:ring-purple-200 ${errors.desiredChange ? 'border-red-300' : 'border-purple-100 focus:border-purple-300'}`}
                rows={4}
                placeholder="상담 후 학생에게 기대하는 긍정적인 변화나 목표를 적어주세요."
              />
              {errors.desiredChange && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/>{errors.desiredChange.message}</p>}
            </div>

            {/* Added: Strengths & Activities */}
            <div className="pt-6 border-t border-purple-100">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-slate-700 font-bold mb-2">학생의 강점</label>
                  <textarea 
                    {...register('strengths')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all resize-none"
                    rows={2}
                    placeholder="학급에서 관찰되는 학생의 긍정적인 자원이나 강점을 적어주세요."
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-2">학생이 좋아하는 활동</label>
                  <input 
                    {...register('favoriteActivities')}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all"
                    placeholder="예: 체육 활동, 만들기, 독서 등"
                  />
                </div>
              </div>
            </div>
          </Section>

          {/* Section B: School Life Scale */}
          <Section title="학교 생활 척도" icon={Activity}>
            <div className="grid grid-cols-1 gap-6">
              {['peerRelation', 'classAttitude', 'learningAbility', 'compliance'].map((name) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup5 
                      label={
                        name === 'peerRelation' ? '친구 관계' :
                        name === 'classAttitude' ? '수업 태도' :
                        name === 'learningAbility' ? '학습 능력' : '교사 지시 순응도'
                      }
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              ))}
            </div>
          </Section>

          {/* Section C: Behavioral Characteristics */}
          <Section title="행동 특성 관찰" icon={Brain}>
            <div className="grid grid-cols-1 gap-6">
               {['inattention', 'impulsivity', 'aggression'].map((name) => (
                <Controller
                  key={name}
                  name={name}
                  control={control}
                  render={({ field }) => (
                    <RadioGroup3 
                      label={
                        name === 'inattention' ? '부주의함' :
                        name === 'impulsivity' ? '충동성' : '공격성'
                      }
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              ))}
            </div>

            {/* New Input for Actual Examples */}
            <div className="mt-6 pt-6 border-t border-purple-100">
               <label className="block text-slate-700 font-bold mb-2">학생의 모습에 대한 실제 사례</label>
               <textarea 
                {...register('behavioralExamples')}
                className="w-full px-4 py-4 rounded-xl bg-slate-50 border border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none transition-all resize-none"
                rows={4}
                placeholder="구체적인 일화나 관찰된 행동 사례를 적어주세요."
               />
            </div>
          </Section>

          {/* Section D: Emotional State */}
          <Section title="정서 상태" icon={LayoutGrid}>
             <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-50">
               <label className="block text-slate-700 font-bold mb-4">학생의 주된 정서 (복수 선택 가능)</label>
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                 {['불안', '우울', '분노', '위축', '무기력', '짜증', '기쁨', '평온', '예민함', '기타'].map((emotion) => (
                   <label key={emotion} className="flex items-center space-x-2 cursor-pointer bg-white px-3 py-2 rounded-lg border border-purple-100 hover:border-purple-300 transition-colors">
                     <input 
                       type="checkbox" 
                       value={emotion}
                       {...register('emotions')}
                       className="w-4 h-4 text-purple-600 rounded focus:ring-purple-200"
                     />
                     <span className="text-slate-600 text-sm">{emotion}</span>
                   </label>
                 ))}
               </div>
               {/* Conditional input for 'Other' */}
               {selectedEmotions && selectedEmotions.includes('기타') && (
                 <div className="mt-4 animate-fade-in-up">
                   <label className="block text-slate-700 font-bold mb-2 text-sm">기타 정서 내용</label>
                   <input
                     {...register('otherEmotionDetail')}
                     className="w-full px-4 py-2 rounded-xl bg-white border border-purple-100 focus:ring-2 focus:ring-purple-200 outline-none"
                     placeholder="관찰된 정서를 구체적으로 적어주세요."
                   />
                 </div>
               )}
             </div>
          </Section>

          {/* Section E: Other Observations */}
          <Section title="기타 관찰 내용" icon={CheckSquare}>
            <div className="space-y-6">
              <div>
                <label className="block text-slate-700 font-bold mb-3">교실에서 눈에 띄는 반복 행동이 있나요?</label>
                <div className="flex gap-4">
                  {['yes', 'no'].map((val) => (
                    <label key={val} className="flex-1 cursor-pointer">
                      <input 
                        type="radio" 
                        value={val}
                        {...register('repetitiveBehavior')}
                        className="peer sr-only"
                      />
                      <div className="w-full py-3 rounded-xl border border-purple-100 bg-white text-center text-slate-600 font-medium peer-checked:bg-purple-500 peer-checked:text-white peer-checked:shadow-md transition-all">
                        {val === 'yes' ? '있음' : '없음'}
                      </div>
                    </label>
                  ))}
                </div>
                 {/* Conditional input for 'Yes' */}
                 {repetitiveBehavior === 'yes' && (
                  <div className="mt-4 animate-fade-in-up">
                    <label className="block text-slate-700 font-bold mb-2 text-sm">반복 행동 내용</label>
                    <input
                      {...register('repetitiveBehaviorDetail')}
                      className="w-full px-4 py-2 rounded-xl bg-white border border-purple-100 focus:ring-2 focus:ring-purple-200 outline-none"
                      placeholder="예: 손톱 물어뜯기, 다리 떨기 등"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">문제 상황의 빈도</label>
                <textarea 
                  {...register('frequency')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                  rows={2}
                  placeholder="예: 일주일에 2-3회 정도 수업 시간에 발생함"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-2">문제 상황의 심각성</label>
                <textarea 
                  {...register('severity')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-purple-100 focus:bg-white focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                  rows={2}
                  placeholder="수업 진행이 어려울 정도로 소란을 피움"
                />
              </div>
            </div>
          </Section>

          {/* Submit Button */}
          <div className="pt-6 animate-fade-in-up">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-5 rounded-2xl shadow-xl shadow-purple-200/60 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group text-xl"
            >
              <Sparkles size={24} className="text-purple-200" />
              <span>상담 의뢰하기</span>
              <Send 
                size={24} 
                className={`transition-transform duration-700 ml-1 ${isSubmitting ? 'translate-x-12 -translate-y-12 opacity-0' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} 
              />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
