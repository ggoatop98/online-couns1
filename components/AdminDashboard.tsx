
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, Smile, Home, BookOpen, Search, Filter, 
  Loader2, MoreHorizontal, Calendar, ArrowRight 
} from 'lucide-react';
import { db, auth } from '../firebase';
import { AdminDetailModal } from './AdminDetailModal';

type TabType = 'student' | 'parent' | 'teacher';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('student');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Data fetching logic
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setData([]);
    try {
      const collectionName = `counseling_${activeTab}`;
      // Basic query - note: complex sorting might require Firestore index
      // For now, fetching all and sorting client-side is safer for prototyping
      const q = query(collection(db, collectionName)); 
      const querySnapshot = await getDocs(q);
      
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort client-side by createdAt descending
      items.sort((a: any, b: any) => {
         const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
         const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
         return dateB.getTime() - dateA.getTime();
      });

      setData(items);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const collectionName = `counseling_${activeTab}`;
      await updateDoc(doc(db, collectionName, id), {
        status: newStatus
      });
      // Update local state
      setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      
      // Update modal state if open
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("상태 변경 실패");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const collectionName = `counseling_${activeTab}`;
      await deleteDoc(doc(db, collectionName, id));
      // Update local state
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedItem(null); // Close modal
    } catch (error) {
      console.error("Error deleting document:", error);
      alert("삭제 실패");
    }
  };

  const getTabColor = (tab: TabType) => {
    switch(tab) {
      case 'student': return 'text-blue-600 bg-blue-100';
      case 'parent': return 'text-amber-600 bg-amber-100';
      case 'teacher': return 'text-purple-600 bg-purple-100';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-bold text-sm">ADMIN</span>
              <h1 className="text-xl font-bold text-slate-800">위클래스 관리자</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                to="/"
                className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors text-sm"
              >
                <Home size={18} />
                메인으로
              </Link>
              
              <div className="w-px h-4 bg-slate-200"></div>

              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors text-sm"
              >
                <LogOut size={18} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Tab Navigation */}
        <div className="flex space-x-2 md:space-x-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab('student')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
              activeTab === 'student' ? 'bg-blue-500 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Smile size={20} /> 학생 상담
          </button>
          <button
            onClick={() => setActiveTab('parent')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
              activeTab === 'parent' ? 'bg-amber-500 text-white shadow-lg shadow-orange-200' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Home size={20} /> 학부모 상담
          </button>
          <button
            onClick={() => setActiveTab('teacher')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
              activeTab === 'teacher' ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-white text-slate-500 hover:bg-slate-100'
            }`}
          >
            <BookOpen size={20} /> 교사 의뢰
          </button>
        </div>

        {/* List View */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
          {/* List Header */}
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
            <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${activeTab === 'student' ? 'bg-blue-500' : activeTab === 'parent' ? 'bg-amber-500' : 'bg-purple-600'}`}></span>
              신청 내역 ({data.length})
            </h2>
            <button onClick={fetchData} className="p-2 hover:bg-white rounded-full transition-all text-slate-400 hover:text-blue-500">
              <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
               <Loader2 size={40} className="text-slate-300 animate-spin" />
               <p className="text-slate-400 font-medium">데이터를 불러오는 중...</p>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 gap-4 text-slate-300">
               <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center">
                 <Search size={30} />
               </div>
               <p>아직 신청 내역이 없습니다.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.map((item) => (
                <div 
                  key={item.id} 
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group flex items-center justify-between gap-4"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                        item.status === '상담완료' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        {item.status || '접수대기'}
                      </span>
                      <span className="text-slate-400 text-xs flex items-center gap-1">
                        <Calendar size={12} />
                        {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-slate-800 truncate">
                      {item.name || item.childName || item.studentName}
                      <span className="text-sm font-medium text-slate-500 ml-2">
                        {item.gradeClass}
                      </span>
                    </h3>
                    
                    <p className="text-slate-500 text-sm truncate mt-1">
                      {item.reason || item.worries || item.referralReason}
                    </p>
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-2 bg-white border border-slate-200 rounded-full text-slate-400 hover:text-blue-500 hover:border-blue-300 shadow-sm">
                       <ArrowRight size={20} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AdminDetailModal 
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        data={selectedItem}
        type={activeTab}
        onUpdateStatus={handleUpdateStatus}
        onDelete={handleDelete}
      />
    </div>
  );
};
