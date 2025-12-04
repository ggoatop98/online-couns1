import React from 'react';
import { Heart } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-12 space-y-4 animate-fade-in-down">
      <div className="flex justify-center items-center gap-2 mb-2">
        <Heart className="w-8 h-8 text-pink-400 fill-pink-400 animate-pulse" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800 tracking-tight">
        Wee Class
      </h1>
      <p className="text-slate-500 text-lg md:text-xl font-medium">
        솔빛초등학교 위클래스 상담 신청서를 작성해 주세요.
      </p>
    </header>
  );
};