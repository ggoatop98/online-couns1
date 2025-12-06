import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, AlertTriangle, ShieldCheck, Home } from 'lucide-react';
import { auth } from '../firebase';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Only allow login
      await auth.signInWithEmailAndPassword(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('이메일 또는 비밀번호가 일치하지 않습니다.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('로그인 시도가 너무 많습니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative">
      {/* Home Button */}
      <Link 
        to="/" 
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors group"
      >
        <div className="bg-white p-2.5 rounded-full shadow-sm border border-slate-100 group-hover:border-slate-200 group-hover:shadow-md transition-all">
           <Home size={20} />
        </div>
        <span className="font-bold text-sm hidden sm:block">메인으로 돌아가기</span>
      </Link>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 md:p-10 animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-4 ring-blue-50/50">
            <ShieldCheck size={40} className="text-blue-500" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            관리자 로그인
          </h1>
          <p className="text-slate-500 mt-2">
            상담 관리 시스템 접속을 위해<br/>로그인해 주세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">이메일</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                placeholder="admin@school.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1 ml-1">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 outline-none focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm py-3 px-4 rounded-xl flex items-center gap-2 font-medium animate-bounce-in">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? '로그인 중...' : '로그인 하기'}
            {!isLoading && <ArrowRight size={20} />}
          </button>
        </form>
      </div>
    </div>
  );
};