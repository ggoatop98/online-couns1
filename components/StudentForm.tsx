import React, { useState } from 'react';
import { useForm, useController } from 'react-hook-form';
import { 
  Send, ChevronLeft, Frown, Meh, Smile, Laugh, Heart, 
  Calendar, Clock, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { StudentFormData } from '../types';
import { SuccessModal } from './SuccessModal';
import { ErrorModal } from './ErrorModal';
import { sendNotification } from '../services/notificationService';

// Shim for Controller since it's missing in the environment
const Controller = ({ control, name, render, rules }: any) => {
  const { field, fieldState } = useController({ control, name, rules });
  return render({ field, fieldState });
};

// Reusable Emotion Rating Component
const EmotionRating = ({ 
  value, 
  onChange, 
  label 
}: { 
  value: number; 
  onChange: (val: number) => void; 
  label: string;
}) => {
  const icons = [
    { level: 1, Icon: Frown, color: 'text-red-400', label: '힘들어요' },
    { level: 2, Icon: Meh, color: 'text-orange-400', label: '별로예요' },
    { level: 3, Icon: Meh, color: 'text-yellow-400', label: '그저 그래요' },
    { level: 4, Icon: Smile, color: 'text-lime-500', label: '좋아요' },
    { level: 5, Icon: Laugh, color: 'text-green-500', label: '정말 좋아요' },
  ];

  return (
    <div className="mb-6">
      <label className="block text-slate-700 font-bold mb-3">{label}</label>
      <div className="flex justify-between md:justify-start md:gap-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        {icons.map((item) => (
          <button
            key={item.level}
            type="button"
            onClick={() => onChange(item.level)}
            className={`
              flex flex-col items-center gap-2 transition-all duration-300 transform
              ${value === item.level ? 'scale-110 -translate-y-1' : 'opacity-50 hover:opacity-100 hover:scale-105'}
            `}
          >
            <div className={`
              w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center bg-white shadow-sm border-2
              ${value === item.level ? `border-${item.color.split('-')[1]}-400 shadow-md` : 'border-transparent'}
            `}>
              <item.Icon className={`w-6 h-6 md:w-8 md:h-8 ${item.color}`} strokeWidth={2.5} />
            </div>
            <span className={`text-xs font-medium ${value === item.level ? 'text-slate-800' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const StudentForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm<StudentFormData>({
    defaultValues: {
      peerRelation: 3,
      fatherRelation: 3,
      motherRelation: 3,
      confidentiality: []
    }
  });

  // Watch confidentiality to handle mutual exclusivity logic
  const confidentiality = watch('confidentiality');

  const handleConfidentialityChange = (value: string, checked: boolean) => {
    let newValues = [...(confidentiality || [])];
    
    if (value === '알리고 싶지 않음') {
      // If "Secret" is checked, clear everything else and only set "Secret"
      if (checked) {
        setValue('confidentiality', ['알리고 싶지 않음']);
      } else {
        setValue('confidentiality', []);
      }
    } else {
      // If "Parents" or "Teacher" is checked
      if (checked) {
        // Remove "Secret" if it exists, add the new value
        newValues = newValues.filter(v => v !== '알리고 싶지 않음');
        newValues.push(value);
        setValue('confidentiality', newValues);
      } else {
        // Just remove the value
        setValue('confidentiality', newValues.filter(v => v !== value));
      }
    }
  };

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save to Firebase 'counseling_student' collection
      await addDoc(collection(db, 'counseling_student'), {
        ...data,
        createdAt: serverTimestamp(),
        status: '접수대기'
      });
      
      console.log("=== 상담 신청 데이터 저장 완료 ===");
      
      // 알림 전송 (비동기로 실행, UI 블로킹 방지)
      sendNotification('student', data);

      // Show success modal instead of alert
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
    if (errors.name) missing.push("이름");
    if (errors.gradeClass) missing.push("학년/반");
    if (errors.reason) missing.push("상담 신청 이유");
    
    if (missing.length > 0) {
      setMissingFields(missing);
      setShowErrorModal(true);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const SectionTitle = ({ title, icon: Icon }: { title: string, icon: any }) => (
    <div className="flex items-center gap-2 mb-4 text-blue-600 border-b-2 border-blue-100 pb-2">
      <Icon className="w-5 h-5" />
      <h3 className="text-xl font-bold">{title}</h3>
    </div>
  );

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden flex justify-center">
      {/* Background Bubbles (Same as Landing) */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none"></div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        message="상담 신청 완료!"
        subMessage="선생님이 확인 후 연락줄게요. 조금만 기다려주세요."
      />

      <ErrorModal 
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        missingFields={missingFields}
      />

      <div className="w-full max-w-2xl z-10">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-slate-500 hover:text-slate-700 transition-colors bg-white/50 px-4 py-2 rounded-full backdrop-blur-sm">
            <ChevronLeft size={20} className="mr-1" />
            메인으로
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
          
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in-down">
            <span className="inline-block p-3 rounded-full bg-blue-100 text-blue-500 mb-3">
              <Smile size={32} fill="currentColor" className="text-blue-500/20" />
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800">학생 상담 신청</h1>
            <p className="text-slate-500 mt-2">비밀은 꼭 지켜줄게요. 편하게 이야기해요.</p>
          </div>

          {/* Section A: Basic Info */}
          <section className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <SectionTitle title="기본 정보" icon={CheckCircle2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-700 font-bold mb-2">이름 <span className="text-red-400">*</span></label>
                <input 
                  {...register('name', { required: '이름을 입력해주세요.' })}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 ${errors.name ? 'border-red-300' : 'border-slate-100 focus:border-blue-300'}`}
                  placeholder="홍길동"
                />
                {errors.name && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-2">학년 / 반 <span className="text-red-400">*</span></label>
                <input 
                  {...register('gradeClass', { required: '학년/반을 입력해주세요.' })}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 ${errors.gradeClass ? 'border-red-300' : 'border-slate-100 focus:border-blue-300'}`}
                  placeholder="예: 3학년 2반"
                />
                {errors.gradeClass && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {errors.gradeClass.message}</p>}
              </div>
            </div>
          </section>

          {/* Section B: Counseling Content */}
          <section className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <SectionTitle title="상담 내용" icon={Heart} />
            
            <div className="mb-6">
              <label className="block text-slate-700 font-bold mb-2">상담 신청 이유 <span className="text-red-400">*</span></label>
              <textarea 
                {...register('reason', { required: '상담하고 싶은 내용을 적어주세요.' })}
                className={`w-full h-32 px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 resize-none ${errors.reason ? 'border-red-300' : 'border-slate-100 focus:border-blue-300'}`}
                placeholder="어떤 점이 힘든가요? 자세히 적어주세요."
              />
              {errors.reason && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {errors.reason.message}</p>}
            </div>

            <Controller
              name="peerRelation"
              control={control}
              render={({ field }) => (
                <EmotionRating 
                  label="친구 관계는 어떤가요?" 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </section>

          {/* Section C: Family */}
          <section className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <SectionTitle title="나의 가족" icon={Smile} />
            
            <Controller
              name="fatherRelation"
              control={control}
              render={({ field }) => (
                <EmotionRating 
                  label="아빠와의 관계" 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
             <Controller
              name="motherRelation"
              control={control}
              render={({ field }) => (
                <EmotionRating 
                  label="엄마와의 관계" 
                  value={field.value} 
                  onChange={field.onChange} 
                />
              )}
            />
          </section>

          {/* Section D: Deep Questions */}
          <section className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <SectionTitle title="나 자신에 대하여" icon={Laugh} />
            
            <div className="space-y-5">
              <div>
                <label className="block text-slate-700 font-bold mb-2">나 자신에 대한 생각</label>
                <input 
                  {...register('selfPerception')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="내가 생각하는 나의 장점이나 단점은?"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-2">요즘 나의 감정</label>
                <input 
                  {...register('currentEmotion')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="예: 슬픔, 불안, 화, 기쁨 등"
                />
              </div>
              <div>
                <label className="block text-slate-700 font-bold mb-2">변화되고 싶은 점</label>
                <input 
                  {...register('desiredChange')}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-100 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
                  placeholder="상담을 통해 어떻게 달라지고 싶나요?"
                />
              </div>
            </div>
          </section>

          {/* Section E: Finishing Up */}
          <section className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-lg border border-white animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <SectionTitle title="상담 시간은 직접 상담실에 방문해서 상담 선생님과 상의해 주세요. (언제 방문할 수 있나요?*)" icon={Calendar} />
            
            {/* The individual labels for date/time were requested to be removed and replaced by the single question above */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="date"
                  {...register('date')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-slate-600"
                />
              </div>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-400" size={20} />
                <select 
                  {...register('time')}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-100 outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-300 text-slate-600 appearance-none"
                >
                  <option value="">시간 선택</option>
                  <option value="점심시간">점심시간</option>
                  <option value="방과후">방과후</option>
                  <option value="수업시간">수업시간 (선생님 허락 필요)</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <label className="block text-slate-700 font-bold mb-3">상담 사실을 알려도 되는 사람 (선택)</label>
              <div className="flex flex-wrap gap-3">
                {['부모님', '담임 선생님', '알리고 싶지 않음'].map((option) => {
                  const isChecked = confidentiality?.includes(option);
                  return (
                    <label 
                      key={option} 
                      className={`
                        flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border transition-all
                        ${isChecked 
                          ? 'bg-blue-50 border-blue-300 text-blue-700' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}
                      `}
                    >
                      <input 
                        type="checkbox" 
                        value={option}
                        checked={isChecked}
                        onChange={(e) => handleConfidentialityChange(option, e.target.checked)}
                        className="w-5 h-5 text-blue-500 rounded focus:ring-blue-200 accent-blue-500"
                      />
                      <span>{option}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Submit Button */}
          <div className="pt-4 pb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              <span className="text-lg">상담 신청하기</span>
              <Send 
                size={24} 
                className={`transition-transform duration-700 ${isSubmitting ? 'translate-x-12 -translate-y-12 opacity-0' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} 
              />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};