import React, { useState } from 'react';
import { X, Trash2, Calendar, FileText, Download, Loader2 } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import FileSaver from 'file-saver';

interface AdminDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'student' | 'parent' | 'teacher';
  onUpdateStatus: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

// 1. Explicit Field Order (Strictly matching input forms)
const ORDERED_FIELDS = {
  student: [
    'name', 
    'gradeClass', 
    'reason', 
    'peerRelation', 
    'fatherRelation', 
    'motherRelation', 
    'selfPerception', 
    'currentEmotion', 
    'desiredChange', 
    'confidentiality', 
    'date', 
    'time'
  ],
  parent: [
    'childName', 
    'gradeClass', 
    'relation', 
    'contact', 
    'desiredTime', 
    'worries', 
    'examples', 
    'onsetAndCause', 
    'attemptsAndEffects', 
    'desiredChange', 
    'medicalHistory', 
    'motherRelationScore', 
    'fatherRelationScore', 
    'temperament', 
    'exceptionalSituations',
    'note' // Added field
  ],
  teacher: [
    'studentName', 
    'gradeClass', 
    'referralReason',
    'desiredChange', // Added field
    'peerRelation', 
    'classAttitude', 
    'learningAbility', 
    'compliance',
    'inattention', 
    'impulsivity', 
    'aggression',
    'behavioralExamples', 
    'emotions', 
    'otherEmotionDetail',
    'repetitiveBehavior', 
    'repetitiveBehaviorDetail', 
    'frequency', 
    'severity'
  ]
};

// 2. Base Labels
const FIELD_LABELS: Record<string, string> = {
  // Common / Basic
  name: "이름",
  studentName: "학생 이름",
  childName: "자녀 이름",
  gradeClass: "학년 / 반",
  createdAt: "신청 일시",
  status: "상태",
  contact: "연락처",
  relation: "학생과의 관계",

  // Student Form
  reason: "상담 신청 이유",
  peerRelation: "친구 관계",
  fatherRelation: "아빠와의 관계",
  motherRelation: "엄마와의 관계",
  selfPerception: "나 자신에 대한 생각",
  currentEmotion: "요즘 나의 감정",
  confidentiality: "상담 사실을 알려도 되는 사람",
  date: "희망 날짜",
  time: "희망 시간",

  // Parent Form
  desiredTime: "상담 희망 시간",
  worries: "아이에 대해서 걱정되는 것",
  examples: "학생의 모습에 대한 실제 사례",
  onsetAndCause: "문제의 시작 시점과 원인",
  attemptsAndEffects: "지금까지 시도해 본 해결 방법과 그 효과",
  medicalHistory: "병원 진료 또는 상담 경험 유무",
  motherRelationScore: "엄마와의 관계 점수",
  fatherRelationScore: "아빠와의 관계 점수",
  temperament: "아동의 기질적 특성",
  exceptionalSituations: "예외적 상황 (긍정적 자원)",
  note: "참고",

  // Teacher Form
  referralReason: "의뢰 사유",
  classAttitude: "수업 태도",
  learningAbility: "학습 능력",
  compliance: "교사 지시 순응도",
  inattention: "부주의함",
  impulsivity: "충동성",
  aggression: "공격성",
  behavioralExamples: "학생의 모습에 대한 실제 사례", 
  emotions: "정서 상태 (주된 정서)",
  otherEmotionDetail: "기타 정서 내용",
  repetitiveBehavior: "교실에서 눈에 띄는 반복 행동이 있나요?",
  repetitiveBehaviorDetail: "반복 행동 내용",
  frequency: "문제 상황의 빈도",
  severity: "문제 상황의 심각성",
};

// 3. Helper to get label
const getLabel = (key: string, type: 'student' | 'parent' | 'teacher'): string => {
  if (key === 'desiredChange') {
    // Both Parent and Teacher forms use this label
    if (type === 'parent' || type === 'teacher') {
       return "상담을 통해 기대하는 변화";
    }
    // Student form uses this label
    return "변화되고 싶은 점";
  }
  return FIELD_LABELS[key] || key;
};

// 4. Value Formatters
const formatValue = (key: string, value: any, type: string): string => {
  if (value === null || value === undefined || value === '') return '-';
  if (key === 'createdAt' && value.toDate) return value.toDate().toLocaleString();
  if (Array.isArray(value)) return value.join(', ');

  // Student Scales (1-5)
  if (type === 'student' && ['peerRelation', 'fatherRelation', 'motherRelation'].includes(key)) {
    const map = ['-', '힘들어요', '별로예요', '그저 그래요', '좋아요', '정말 좋아요'];
    return map[Number(value)] || `${value}점`;
  }

  // Parent Scales (1-10)
  if (type === 'parent' && key.includes('Score')) {
    return `${value}점`;
  }

  // Teacher Scales
  if (type === 'teacher') {
    if (['peerRelation', 'classAttitude', 'learningAbility', 'compliance'].includes(key)) {
      if (!isNaN(Number(value))) {
         const map = ['-', '매우 나쁨', '나쁨', '보통', '좋음', '매우 좋음'];
         return map[Number(value)] || value;
      }
      return value;
    }
    if (['inattention', 'impulsivity', 'aggression'].includes(key)) {
      const map: Record<string, string> = {
        'mild': '양호함', 'moderate': '조금 심함', 'severe': '매우 심함',
        '1': '양호함', '2': '조금 심함', '3': '매우 심함'
      };
      return map[value] || value;
    }
    if (key === 'repetitiveBehavior') {
      return value === 'yes' ? '있음' : value === 'no' ? '없음' : value;
    }
  }

  return value.toString();
};

export const AdminDetailModal: React.FC<AdminDetailModalProps> = ({ 
  isOpen, onClose, data, type, onDelete 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen || !data) return null;

  const displayFields = ORDERED_FIELDS[type] || [];
  const title = data.name || data.childName || data.studentName;
  const subtitle = type === 'student' ? '학생 상담 신청서' : type === 'parent' ? '학부모 상담 신청서' : '교사 상담 의뢰서';

  const handleDelete = () => {
    if (deleteConfirm) {
      onDelete(data.id);
      onClose();
      setDeleteConfirm(false);
    } else {
      setDeleteConfirm(true);
    }
  };

  const handleDownloadDoc = async () => {
    setIsGenerating(true);
    try {
      const dateStr = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : '날짜 없음';

      // Map fields to Paragraphs
      const contentParagraphs = displayFields.flatMap((key) => {
         if (data[key] === undefined || data[key] === null || data[key] === '') return [];
         
         const label = getLabel(key, type);
         const value = formatValue(key, data[key], type);

         return [
           // Label (Bold)
           new Paragraph({
             children: [
               new TextRun({
                 text: `■ ${label}`,
                 bold: true,
                 size: 24, // 12pt (docx uses half-points)
                 font: "Malgun Gothic"
               }),
             ],
             spacing: { before: 200, after: 100 }, // Spacing in twips
           }),
           // Value
           new Paragraph({
             children: [
               new TextRun({
                 text: value,
                 size: 24,
                 font: "Malgun Gothic"
               }),
             ],
             spacing: { after: 200 },
           })
         ];
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: [
              // Title
              new Paragraph({
                text: `${title} - ${subtitle}`,
                heading: HeadingLevel.HEADING_1,
                alignment: AlignmentType.CENTER,
                spacing: { after: 400 },
              }),
              // Date
              new Paragraph({
                text: `신청일: ${dateStr}`,
                alignment: AlignmentType.RIGHT,
                spacing: { after: 400 },
              }),
              // Separator line (Using empty paragraph with border could work, but simple spacing is safer)
              new Paragraph({ text: "", spacing: { after: 200 } }),
              // Content
              ...contentParagraphs
            ],
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      FileSaver.saveAs(blob, `${title}_${subtitle}.docx`);
    } catch (error) {
      console.error("Error generating document:", error);
      alert("문서 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

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
                {subtitle}
              </span>
              <span className="text-slate-400 text-sm flex items-center gap-1">
                <Calendar size={14} />
                {data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              {title}
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
          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-6">
            {displayFields.map((key) => {
               if (data[key] === undefined || data[key] === null || data[key] === '') return null;

               const label = getLabel(key, type);
               const value = formatValue(key, data[key], type);
               const isLongText = typeof value === 'string' && value.length > 30;

               return (
                 <div key={key} className={`border-b border-slate-100 pb-4 ${isLongText ? 'col-span-1' : ''}`}>
                   <p className="text-sm font-bold text-slate-400 mb-2">{label}</p>
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
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-slate-500 font-bold hover:bg-slate-200 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleDownloadDoc}
              disabled={isGenerating}
              className="px-5 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={18} className="animate-spin"/> : <FileText size={18} />}
              {isGenerating ? '생성 중...' : '문서 다운로드 (.docx)'}
            </button>
          </div>

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
                  네
                </button>
             </div>
          )}
        </div>

      </div>
    </div>
  );
};