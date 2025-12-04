import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  subMessage?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, message, subMessage }) => {
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
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50">
          <CheckCircle size={40} strokeWidth={3} />
        </div>
        
        <h3 className="text-2xl font-bold text-slate-800 mb-2">
          {message}
        </h3>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          {subMessage || "입력하신 내용이 안전하게 전달되었습니다."}
        </p>
        
        <button 
          onClick={onClose}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-95"
        >
          확인
        </button>
      </div>
    </div>
  );
};