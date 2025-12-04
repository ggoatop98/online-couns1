import React, { useState, useEffect } from 'react';
import { X, Lock, ArrowRight, AlertTriangle } from 'lucide-react';
import { PasswordModalProps } from '../types';

export const PasswordModal: React.FC<PasswordModalProps> = ({ isOpen, onClose, onSubmit, errorMessage }) => {
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setLocalError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length > 0) {
      onSubmit(password);
    } else {
      setLocalError(true);
    }
  };

  const hasError = localError || !!errorMessage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 transform transition-all animate-bounce-in z-50">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mb-4 ring-4 ring-purple-50">
            <Lock size={32} />
          </div>

          <h3 className="text-2xl font-bold text-slate-800 mb-2">선생님 인증</h3>
          <p className="text-slate-500 mb-8">
            선생님 전용 페이지입니다.<br/>
            지정된 비밀번호를 입력해 주세요.
          </p>

          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative mb-6">
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setLocalError(false);
                }}
                placeholder="비밀번호 입력"
                className={`
                  w-full px-6 py-4 rounded-xl bg-slate-50 border-2 outline-none text-lg text-center tracking-widest
                  transition-all focus:bg-white placeholder:tracking-normal placeholder:text-base
                  ${hasError 
                    ? 'border-red-300 focus:border-red-400 focus:ring-4 focus:ring-red-100 text-red-500' 
                    : 'border-slate-100 focus:border-purple-300 focus:ring-4 focus:ring-purple-100 text-slate-800'}
                `}
                autoFocus
              />
              {/* Error Message Display */}
              {hasError && (
                <div className="absolute -bottom-6 left-0 w-full text-center">
                   <p className="text-red-500 text-xs font-bold flex items-center justify-center gap-1">
                     <AlertTriangle size={12} />
                     {errorMessage || "비밀번호를 입력해주세요."}
                   </p>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <span>확인</span>
              <ArrowRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};