import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  missingFields: string[];
}

export const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, missingFields }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-sm rounded-3xl shadow-2xl p-8 text-center animate-bounce-in z-10">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-red-50/50">
          <AlertCircle size={40} strokeWidth={2.5} />
        </div>
        
        <h3 className="text-xl font-bold text-slate-800 mb-2">
          입력하지 않은 항목이 있어요!
        </h3>
        
        <p className="text-slate-500 text-sm mb-6">
          다음 필수 항목을 확인해 주세요.
        </p>

        <div className="bg-red-50 rounded-xl p-4 mb-8 text-left">
          <ul className="space-y-2">
            {missingFields.map((field, index) => (
              <li key={index} className="flex items-start gap-2 text-red-600 text-sm font-bold">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
                {field}
              </li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={onClose}
          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-slate-200 transition-all active:scale-95"
        >
          확인했습니다
        </button>
      </div>
    </div>
  );
};