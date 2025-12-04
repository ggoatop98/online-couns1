import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-16 pb-8 text-center">
      <Link 
        to="/admin" 
        className="text-sm text-slate-400 hover:text-slate-600 transition-colors decoration-slate-300 hover:underline underline-offset-4"
      >
        관리자 페이지로 이동
      </Link>
      <div className="mt-2 text-xs text-slate-300">
        © 2024 Solbit Elementary School Wee Class
      </div>
    </footer>
  );
};