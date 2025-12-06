import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center mb-16 pt-8 animate-fade-in-down">
      <h1 className="text-5xl md:text-6xl font-black text-slate-800 tracking-tighter mb-4">
        Wee Class
      </h1>
      <p className="text-slate-500 text-lg font-medium">
        위클래스 상담 신청서를 작성해 주세요.
      </p>
    </header>
  );
};