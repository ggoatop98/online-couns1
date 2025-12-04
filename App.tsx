import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Smile, Home, BookOpen } from 'lucide-react';
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      
      {/* Decorative background elements */}
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
        
        {/* Application Forms */}
        <Route path="/student/apply" element={<StudentForm />} />
        <Route path="/parent/apply" element={<ParentForm />} />
        <Route path="/teacher/apply" element={<TeacherForm />} />
        
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route 
          path="/admin/dashboard" 
          element={
            <RequireAuth>
              <AdminDashboard />
            </RequireAuth>
          } 
        />
        
        {/* Default Redirect for /admin */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
};

export default App;