import React, { useState } from 'react';
import { X, Trash2, CheckCircle, Calendar, User, Clock, Phone, AlertCircle } from 'lucide-react';

interface AdminDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'student' | 'parent' | 'teacher';
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

// Field mapping for readable labels
const FIELD_LABELS: Record<string, string> = {
  // Common
  name: "이름",
  studentName: "학생 이름",
  childName: "자녀 이름",
  gradeClass: "학년/반",
  createdAt: "신청 일시",
  status: "상태",
  
  // Student
  reason: "상담 신청 이유",
  peerRelation: "친구 관계 점수",
  fatherRelation: "아빠와의 관계",
  motherRelation: "엄마와의 관계",
  selfPerception: "나 자신에 대한 생각",
  currentEmotion: "요즘 나의 감정",
  desiredChange: "변화되고 싶은 점",
  confidentiality: "비밀 보장 (알릴 사람)",
  date: "희망 날짜",
  time: "희망 시간",

  // Parent
  relation: "학생과의 관계",
  contact: "연락처",
  desiredTime: "희망 시간 (텍스트)",
  worries: "걱정되는 점",
  examples: "실제 사례",
  onsetAndCause: "시작 시점과 원인",
  attemptsAndEffects: "시도해본 방법",
  medicalHistory: "병원/상담 경험",
  motherRelationScore: "엄마 관계 점수",
  fatherRelationScore: "아빠 관계 점수",
  temperament: "기질적 특성",
  exceptionalSituations: "예외적 상황",

  // Teacher
  referralReason: "의뢰 사유",
  classAttitude: "수업 태도",
  learningAbility: "학습 능력",
  compliance: "지시 순응도",
  inattention: "부주의함",
  impulsivity: "충동성",
  aggression: "공격성",
  emotions: "정서 상태",
  otherEmotionDetail: "기타 정서 내용",
  repetitiveBehavior: "반복 행동 유무",
  repetitiveBehaviorDetail: "반복 행동 내용",
  frequency: "빈도",
  severity: "심각성",
};

export const AdminDetailModal: React.FC<AdminDetailModalProps> = ({ 
  isOpen, onClose, data, type, onUpdateStatus, onDelete 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  if (!isOpen || !data) return null;

  const isCompleted = data.status === '상담완료';

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete(data.id);
      onClose();
    } else {
      setDeleteConfirm(true);
    }
  };

  const handleStatusToggle = () => {
    const newStatus = isCompleted ? '접수대기' : '상담완료';
    onUpdateStatus(data.id, newStatus);
  };

  // Helper to format values
  const formatValue = (key: string, value: any) => {
    if (value === null || value === undefined || value === '') return '-';
    if (key === 'createdAt' && value.toDate) return value.toDate().toLocaleString();
    if (Array.isArray(value)) return value.join(', ');
    if (key.includes('Relation') || key === 'score') return typeof value === 'number' ? `${value}점` : value;
    if (key === 'repetitiveBehavior') return value === 'yes' ? '있음' : '없음';
    return value.toString();
  };

  // Fields to exclude from the main view
  const ignoredFields = ['id', 'status', 'createdAt'];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-bounce-in">
        
        {/* Header */}
        <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                type === 'student' ? 'bg-blue-100 text-blue-600' :
                type === 'parent' ? 'bg-amber-100 text-amber-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {type === 'student' ? '학생 상담' : type === 'parent' ? '학부모 상담' : '교사 의뢰'}
              </span>
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Calendar size={14} />
                {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {data.name || data.childName || data.studentName}
              <span className="text-lg font-medium text-slate-500 ml-2">({data.gradeClass})</span>
            </h2>
          </div>
          
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full shadow-sm hover:shadow-md transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-8 space-y-8 flex-1">
          
          {/* Status Control */}
          <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${isCompleted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {isCompleted ? <CheckCircle size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <p className="text-sm text-slate-500 font-bold">현재 상태</p>
                <p className={`font-extrabold ${isCompleted ? 'text-green-600' : 'text-yellow-600'}`}>
                  {isCompleted ? '상담 완료' : '접수 대기'}
                </p>
              </div>
            </div>
            <button
              onClick={handleStatusToggle}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                isCompleted 
                ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {isCompleted ? '대기 상태로 변경' : '완료 처리하기'}
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6">
            {/* Render fields dynamically but nicely */}
            {Object.keys(data).map((key) => {
               if (ignoredFields.includes(key)) return null;
               
               // Filter out empty optional fields
               if (!data[key]) return null;

               const label = FIELD_LABELS[key] || key;
               const value = formatValue(key, data[key]);
               const isLongText = typeof data[key] === 'string' && data[key].length > 50;

               return (
                 <div key={key} className={`border-b border-slate-100 pb-4 ${isLongText ? 'col-span-1' : ''}`}>
                   <p className="text-xs font-bold text-slate-400 mb-1">{label}</p>
                   <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
                     {value}
                   </p>
                 </div>
               );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 border-t border-slate-100 flex justify-between items-center">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors"
          >
            닫기
          </button>

          {!deleteConfirm ? (
            <button 
              onClick={() => setDeleteConfirm(true)}
              className="px-6 py-3 rounded-xl bg-red-50 text-red-500 font-bold hover:bg-red-100 transition-colors flex items-center gap-2"
            >
              <Trash2 size={18} />
              삭제
            </button>
          ) : (
             <div className="flex items-center gap-2 animate-fade-in-up">
                <span className="text-sm text-red-500 font-bold mr-2">정말 삭제할까요?</span>
                <button 
                  onClick={() => setDeleteConfirm(false)}
                  className="px-4 py-2 rounded-lg bg-slate-200 text-slate-600 text-sm font-bold"
                >
                  취소
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-bold shadow-md hover:bg-red-600"
                >
                  네, 삭제합니다
                </button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};