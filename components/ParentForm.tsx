import React, { useState } from 'react';
import { useForm, useController } from 'react-hook-form';
import { 
  Send, ChevronLeft, User, Phone, Clock, FileText, 
  Activity, Heart, AlertCircle, Sparkles, Check
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { ParentFormData } from '../types';
import { SuccessModal } from './SuccessModal';
import { ErrorModal } from './ErrorModal';

// Shim for Controller since it's missing in the environment
const Controller = ({ control, name, render, rules }: any) => {
  const { field, fieldState } = useController({ control, name, rules });
  return render({ field, fieldState });
};

interface SectionCardProps {
  title: string;
  icon: any;
  children: React.ReactNode;
  delay: string;
}

const SectionCard: React.FC<SectionCardProps> = ({ title, icon: Icon, children, delay }) => (
  <section 
    className="bg-white p-6 md:p-8 rounded-3xl shadow-lg shadow-orange-100/50 border border-orange-50 animate-fade-in-up" 
    style={{ animationDelay: delay }}
  >
    <div className="flex items-center gap-3 mb-6 pb-4 border-b border-orange-100">
      <div className="p-2 bg-orange-100 rounded-lg text-orange-500">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h3>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </section>
);

interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
}

const Label: React.FC<LabelProps> = ({ children, required }) => (
  <label className="block text-slate-700 font-bold mb-2 text-base">
    {children}
    {required && <span className="text-red-400 ml-1">*</span>}
  </label>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) => (
  <div>
    <input 
      {...props}
      className={`
        w-full px-4 py-3 rounded-xl bg-slate-50 border transition-all outline-none 
        focus:bg-white focus:ring-2 focus:ring-amber-200 
        ${props.error ? 'border-red-300' : 'border-slate-200 focus:border-amber-300'}
      `}
    />
    {props.error && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {props.error}</p>}
  </div>
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) => (
  <div>
    <textarea 
      {...props}
      className={`
        w-full px-4 py-4 rounded-xl bg-slate-50 border transition-all outline-none resize-none
        focus:bg-yellow-50 focus:ring-2 focus:ring-amber-200
        ${props.error ? 'border-red-300' : 'border-slate-200 focus:border-amber-300'}
      `}
    />
    {props.error && <p className="text-red-400 text-sm mt-1 flex items-center"><AlertCircle size={14} className="mr-1"/> {props.error}</p>}
  </div>
);

const SliderScore = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
    <div className="flex justify-between items-center mb-4">
      <span className="font-bold text-slate-700">{label}</span>
      <span className="text-2xl font-extrabold text-amber-500">{value}점</span>
    </div>
    <input 
      type="range" 
      min="1" 
      max="10" 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
    />
    <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
      <span>매우 나쁨 (1)</span>
      <span>보통 (5)</span>
      <span>매우 좋음 (10)</span>
    </div>
  </div>
);

export const ParentForm: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  
  const { register, handleSubmit, control, watch, formState: { errors } } = useForm<ParentFormData>({
    defaultValues: {
      relation: '엄마',
      medicalHistory: '아니오',
      motherRelationScore: 5,
      fatherRelationScore: 5
    }
  });

  const medicalHistory = watch('medicalHistory');

  const onSubmit = async (data: ParentFormData) => {
    setIsSubmitting(true);
    
    try {
      // Save to Firebase 'counseling_parent' collection
      await addDoc(collection(db, 'counseling_parent'), {
        ...data,
        createdAt: serverTimestamp(),
        status: '접수대기'
      });

      console.log("=== 학부모 상담 신청 데이터 저장 완료 ===");
      setShowSuccessModal(true);
      
    } catch (error) {
      console.error("Error adding document: ", error);
      alert('오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const onError = (errors: any) => {
    const missing = [];
    if (errors.childName) missing.push("자녀 이름");
    if (errors.gradeClass) missing.push("학년/반");
    if (errors.worries) missing.push("걱정되는 점");
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

  return (
    <div className="min-h-screen bg-[#FFFBEB] p-4 md:p-8 relative overflow-hidden flex justify-center">
      {/* Warm Background Blobs */}
      <div className="fixed top-[-5%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000 pointer-events-none"></div>

      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        message="신청 완료"
        subMessage="확인 후 연락드리겠습니다."
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
            <div className="inline-flex p-4 rounded-full bg-amber-100 text-amber-600 mb-4 shadow-sm">
              <User size={40} fill="currentColor" className="text-amber-500/20" />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight">학부모 상담 신청</h1>
            <p className="text-slate-500 mt-3 text-lg">자녀의 마음을 이해하고 돕기 위해 정성껏 작성해 주세요.</p>
          </div>

          {/* Section A: Child Info */}
          <SectionCard title="자녀 기본 정보" icon={User} delay="0.1s">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label required>자녀 이름</Label>
                <Input 
                  placeholder="예: 김사랑" 
                  {...register('childName', { required: '자녀 이름을 입력해주세요.' })} 
                  error={errors.childName?.message}
                />
              </div>
              <div>
                <Label required>학년 / 반</Label>
                <Input 
                  placeholder="예: 2학년 3반" 
                  {...register('gradeClass', { required: '학년/반을 입력해주세요.' })}
                  error={errors.gradeClass?.message}
                />
              </div>
            </div>

            <div>
              <Label>학생과의 관계</Label>
              <div className="flex gap-4 mt-2">
                {['아빠', '엄마'].map((rel) => (
                  <label key={rel} className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative">
                      <input 
                        type="radio" 
                        value={rel} 
                        {...register('relation')} 
                        className="peer sr-only"
                      />
                      <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-amber-500 peer-checked:bg-amber-500 transition-all"></div>
                      <Check size={12} className="absolute top-1 left-1 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>
                    <span className="text-slate-600 group-hover:text-slate-800 transition-colors">{rel}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>연락처</Label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <Input 
                  style={{ paddingLeft: '3rem' }}
                  placeholder="010-0000-0000" 
                  {...register('contact')} 
                />
              </div>
            </div>
          </SectionCard>

          {/* Section B: Time */}
          <SectionCard title="상담 희망 정보" icon={Clock} delay="0.2s">
            <div>
              <Label>상담 희망 시간</Label>
              <Input 
                placeholder="예: 평일 오후 2시 이후 (상담교사와 조율 후 확정됩니다)" 
                {...register('desiredTime')}
              />
            </div>
          </SectionCard>

          {/* Section C: Detail Reason */}
          <SectionCard title="상담 사유 (상세)" icon={FileText} delay="0.3s">
            <div className="space-y-8">
              <div>
                <Label required>아이에 대해서 걱정되는 것</Label>
                <p className="text-sm text-slate-400 mb-2 font-medium">가장 주된 고민을 적어주세요.</p>
                <TextArea 
                  rows={3} 
                  {...register('worries', { required: '걱정되는 부분을 작성해주세요.' })}
                  error={errors.worries?.message}
                />
              </div>

              <div>
                <Label>학생의 모습에 대한 실제 사례</Label>
                <p className="text-sm text-slate-400 mb-2 font-medium">최근에 있었던 구체적인 일화가 있다면 도움이 됩니다.</p>
                <TextArea rows={3} {...register('examples')} />
              </div>

              <div>
                <Label>문제의 시작 시점과 원인</Label>
                <TextArea 
                  placeholder="언제부터, 무엇 때문이라고 생각하시나요?" 
                  rows={2} 
                  {...register('onsetAndCause')}
                />
              </div>

              <div>
                <Label>지금까지 시도해 본 해결 방법과 그 효과</Label>
                <TextArea rows={2} {...register('attemptsAndEffects')} />
              </div>

              <div>
                <Label required>상담을 통해 기대하는 변화</Label>
                <TextArea 
                  rows={3} 
                  {...register('desiredChange', { required: '기대하는 변화를 작성해주세요.' })}
                  error={errors.desiredChange?.message}
                />
              </div>
            </div>
          </SectionCard>

          {/* Section D: Additional Info */}
          <SectionCard title="추가 정보 및 척도 체크" icon={Activity} delay="0.4s">
            
            {/* Added: Strengths & Activities */}
            <div className="space-y-6 mb-8 border-b border-orange-100 pb-8">
              <div>
                <Label>학생의 강점</Label>
                <p className="text-sm text-slate-400 mb-2 font-medium">아이가 잘하거나 칭찬해주고 싶은 점을 적어주세요.</p>
                <TextArea 
                  placeholder="예: 만들기를 잘함, 친구를 잘 도와줌, 인사를 잘함 등" 
                  rows={2}
                  {...register('strengths')}
                />
              </div>
              <div>
                <Label>학생이 좋아하는 활동</Label>
                <Input 
                  placeholder="예: 레고 조립, 축구, 그림 그리기 등" 
                  {...register('favoriteActivities')}
                />
              </div>
            </div>

            <div className="mb-6">
              <Label>병원 진료 또는 상담 경험 유무</Label>
              <div className="flex gap-6 mt-3">
                {['예', '아니오'].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-5 py-3 rounded-xl border border-slate-100 hover:bg-amber-50 transition-colors w-full justify-center">
                    <input 
                      type="radio" 
                      value={opt} 
                      {...register('medicalHistory')} 
                      className="accent-amber-500 w-4 h-4"
                    />
                    <span className="font-bold text-slate-600">{opt}</span>
                  </label>
                ))}
              </div>
              
              {/* Conditional input for medical history detail */}
              {medicalHistory === '예' && (
                <div className="mt-4 animate-fade-in-up">
                  <Label>병원 또는 상담센터의 의견 (상세 내용)</Label>
                  <TextArea 
                    placeholder="진단 내용이나 전문가의 소견 등을 적어주세요." 
                    rows={3}
                    {...register('medicalHistoryDetail')}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Controller
                name="motherRelationScore"
                control={control}
                render={({ field }) => (
                  <SliderScore 
                    label="엄마와의 관계 점수" 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
              <Controller
                name="fatherRelationScore"
                control={control}
                render={({ field }) => (
                  <SliderScore 
                    label="아빠와의 관계 점수" 
                    value={field.value} 
                    onChange={field.onChange} 
                  />
                )}
              />
            </div>

            <div className="space-y-6">
              <div>
                <Label>아동의 기질적 특성</Label>
                <Input 
                  placeholder="예: 예민한 편, 온순한 편, 활동적인 편 등" 
                  {...register('temperament')}
                />
              </div>
              <div>
                <Label>예외적 상황 (긍정적 자원)</Label>
                <TextArea 
                  placeholder="아이가 비교적 안정된 모습을 보이는 상황이나 장소가 있다면 적어주세요." 
                  rows={2}
                  {...register('exceptionalSituations')}
                />
              </div>
              <div>
                <Label>참고</Label>
                <TextArea 
                  placeholder="상담 선생님에게 따로 하고 싶은 말이나 요청할 사항이 있으면 자유롭게 적어주세요." 
                  rows={3}
                  {...register('note')}
                />
              </div>
            </div>
          </SectionCard>

          {/* Submit Button */}
          <div className="pt-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-5 rounded-2xl shadow-xl shadow-amber-200/60 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group text-xl"
            >
              <Sparkles size={24} className="text-yellow-100" />
              <span>상담 신청하기</span>
              <Send 
                size={24} 
                className={`transition-transform duration-700 ml-1 ${isSubmitting ? 'translate-x-12 -translate-y-12 opacity-0' : 'group-hover:translate-x-1 group-hover:-translate-y-1'}`} 
              />
            </button>
            <p className="text-center text-slate-400 mt-4 text-sm font-medium">
              작성하신 내용은 철저히 비밀이 보장됩니다.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
};