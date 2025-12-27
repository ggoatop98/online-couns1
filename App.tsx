
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Smile, Home, BookOpen, AlertCircle, Terminal, ExternalLink } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SelectionCard } from './components/SelectionCard';
import { StudentForm } from './components/StudentForm';
import { ParentForm } from './components/ParentForm';
import { TeacherForm } from './components/TeacherForm';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { RequireAuth } from './components/RequireAuth';
import { CardConfig, UserRole } from './types';
import { isFirebaseConfigured } from './firebase';

const ConfigGuide: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
    <div className="max-w-2xl w-full bg-white rounded-[2.5rem] shadow-2xl shadow-blue-100 overflow-hidden animate-bounce-in">
      <div className="bg-amber-400 p-8 text-white flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-2xl">
          <AlertCircle size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-bold">마지막 단계: Firebase 설정이 필요해요!</h2>
          <p className="opacity-90">데이터를 저장하기 위해 Firebase 연결이 필수입니다.</p>
        </div>
      </div>
      
      <div className="p-8 md:p-12 space-y-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Terminal size={20} className="text-blue-500" />
            어떻게 해결하나요?
          </h3>
          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4 text-slate-600 leading-relaxed">
            <p>1. <strong>Project Settings</strong> (혹은 Secrets 설정) 메뉴를 찾으세요.</p>
            <p>2. 아래의 항목들을 하나씩 추가해 주세요:</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono bg-white p-4 rounded-xl border border-slate-100">
              <li className="text-blue-600">VITE_FIREBASE_API_KEY</li>
              <li className="text-blue-600">VITE_FIREBASE_AUTH_DOMAIN</li>
              <li className="text-blue-600">VITE_FIREBASE_PROJECT_ID</li>
              <li className="text-blue-600">VITE_FIREBASE_STORAGE_BUCKET</li>
              <li className="text-blue-600">VITE_FIREBASE_MESSAGING_SENDER_ID</li>
              <li className="text-blue-600">VITE_FIREBASE_APP_ID</li>
            </ul>
            {/* 수정됨: '>' 문자를 '&gt;'로 변경하여 빌드 에러 방지 */}
            <p className="text-sm text-slate-400 italic">* Firebase 콘솔의 '프로젝트 설정 &gt; 내 앱'에서 위 값들을 확인할 수 있습니다.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a 
            href="https://console.firebase.google.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
          >
            Firebase 콘솔 바로가기
            <ExternalLink size={18} />
          </a>
          <button 
            onClick={() => window.location.reload()} 
            className="flex-1 bg-blue-500 text-white font-bold py-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg shadow-blue-100"
          >
            설정 완료 후 새로고침
          </button>
        </div>
      </div>
    </div>
  </div>
);

const LandingPage: React.FC = () => {
  const cards: CardConfig[] = [
    {
      role: UserRole.STUDENT,
      title: "학생",
      description: "고민이 있나요? 선생님에게 편하게 이야기해주세요.",
      Icon: Smile,
      themeColor: 'blue',
      href: '/student/apply'
    },
    {
      role: UserRole.PARENT,
      title: "학부모",
      description: "자녀에 대해 궁금한 점이나 상담이 필요하신가요?",
      Icon: Home,
      themeColor: 'yellow',
      href: '/parent/apply'
    },
    {
      role: UserRole.TEACHER,
      title: "선생님",
      description: "학생 지도에 대한 고민이나 도움이 필요하신가요?",
      Icon: BookOpen,
      themeColor: 'purple',
      href: '/teacher/apply' 
    }
  ];

  if (!isFirebaseConfigured) {
    return <ConfigGuide />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

      <div className="w-full max-w-6xl z-10">
        <Header />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 lg:gap-12 px-4 md:px-0">
          {cards.map((card) => (
            <SelectionCard
              key={card.role}
              config={card}
            />
          ))}
        </div>
        <Footer />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/apply" element={isFirebaseConfigured ? <StudentForm /> : <Navigate to="/" />} />
        <Route path="/parent/apply" element={isFirebaseConfigured ? <ParentForm /> : <Navigate to="/" />} />
        <Route path="/teacher/apply" element={isFirebaseConfigured ? <TeacherForm /> : <Navigate to="/" />} />
        <Route path="/admin/login" element={isFirebaseConfigured ? <AdminLogin /> : <Navigate to="/" />} />
        <Route 
          path="/admin/dashboard" 
          element={
            isFirebaseConfigured ? (
              <RequireAuth>
                <AdminDashboard />
              </RequireAuth>
            ) : <Navigate to="/" />
          } 
        />
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
