
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, Smile, Home, BookOpen, Search, 
  Loader2, Calendar, ArrowRight, Settings, Trash2, Bell 
} from 'lucide-react';
import { db, auth } from '../firebase';
import { AdminDetailModal } from './AdminDetailModal';
import { PasswordSettingsModal } from './PasswordSettingsModal';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { signOut } from 'firebase/auth';

type TabType = 'student' | 'parent' | 'teacher';

// 체험 모드용 샘플 데이터 생성 헬퍼
const getMockData = (type: TabType) => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  
  // Firestore Timestamp 흉내
  const mockTimestamp = (date: Date) => ({
    toDate: () => date
  });

  if (type === 'student') {
    return [
      { 
        id: 'demo-s-1', 
        name: '김철수', 
        gradeClass: '3학년 2반', 
        reason: '친구들이 자꾸 저를 놀려서 학교 가기가 싫어요. 어떻게 해야 할지 모르겠어요.', 
        status: '접수대기', 
        createdAt: mockTimestamp(now),
        peerRelation: 1, fatherRelation: 4, motherRelation: 5,
        confidentiality: ['부모님', '담임 선생님']
      },
      { 
        id: 'demo-s-2', 
        name: '이영희', 
        gradeClass: '6학년 1반', 
        reason: '중학교 올라가는 게 너무 걱정돼요. 공부도 어렵고...', 
        status: '상담완료', 
        createdAt: mockTimestamp(yesterday),
        peerRelation: 4, fatherRelation: 3, motherRelation: 3,
        confidentiality: []
      }
    ];
  } else if (type === 'parent') {
    return [
      {
        id: 'demo-p-1',
        childName: '박민수',
        gradeClass: '1학년 3반',
        relation: '엄마',
        worries: '아이가 너무 산만하고 집중을 못하는 것 같아요. 집에서도 가만히 있지를 못합니다.',
        desiredChange: '차분하게 앉아서 과제를 할 수 있으면 좋겠어요.',
        contact: '010-1234-5678',
        status: '접수대기',
        createdAt: mockTimestamp(now)
      }
    ];
  } else {
    return [
      {
        id: 'demo-t-1',
        studentName: '최동욱',
        gradeClass: '4학년 5반',
        referralReason: '수업 시간에 소리를 지르거나 돌아다니는 행동이 잦습니다. 친구들과의 다툼도 자주 발생합니다.',
        desiredChange: '수업 규칙을 지키고 친구들과 원만하게 지내기를 바랍니다.',
        status: '진행중',
        createdAt: mockTimestamp(now)
      }
    ];
  }
};

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('student');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  useEffect(() => {
    fetchData();
    setSelectedIds([]);
    setShowBulkDeleteConfirm(false);
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    setData([]);
    setSelectedIds([]);

    // 체험 모드 (DB 없음)
    if (!db) {
      setTimeout(() => {
        setData(getMockData(activeTab));
        setLoading(false);
      }, 500);
      return;
    }

    try {
      const collectionName = `counseling_${activeTab}`;
      
      const q = query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc'),
        limit(50)
      ); 
      
      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setData(items);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      if (error.code === 'failed-precondition') {
        alert("Firestore 인덱스 생성이 필요합니다. 개발자 도구의 콘솔 링크를 확인해주세요.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      sessionStorage.removeItem('demo_auth');
    }
    navigate('/admin/login');
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    // 체험 모드 처리
    if (!db) {
      setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
      return;
    }

    try {
      const collectionName = `counseling_${activeTab}`;
      await updateDoc(doc(db, collectionName, id), {
        status: newStatus
      });
      setData(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem({ ...selectedItem, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const handleDelete = async (id: string) => {
    // 체험 모드 처리
    if (!db) {
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      setSelectedItem(null);
      return;
    }

    try {
      const collectionName = `counseling_${activeTab}`;
      await deleteDoc(doc(db, collectionName, id));
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      setSelectedItem(null);
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); 
    if (e.target.checked) {
      setSelectedIds(data.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
    setShowBulkDeleteConfirm(false);
  };

  const handleCheckboxChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
    setShowBulkDeleteConfirm(false);
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;

    // 체험 모드 처리
    if (!db) {
      setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      return;
    }

    try {
      const collectionName = `counseling_${activeTab}`;
      await Promise.all(
        selectedIds.map(id => deleteDoc(doc(db, collectionName, id)))
      );
      setData(prev => prev.filter(item => !selectedIds.includes(item.id)));
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
    } catch (error: any) {
      console.error("Error bulk deleting:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white shadow-sm border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <span className="bg-slate-800 text-white px-3 py-1 rounded-lg font-bold text-sm">ADMIN</span>
              <h1 className="text-xl font-bold text-slate-800">위클래스 관리자</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-medium transition-colors text-sm">
                <Home size={18} /> 메인으로
              </Link>
              <div className="w-px h-4 bg-slate-200"></div>
              <button onClick={handleLogout} className="flex items-center gap-2 text-slate-500 hover:text-red-600 font-medium transition-colors text-sm">
                <LogOut size={18} /> 로그아웃
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex space-x-2 md:space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: 'student', icon: Smile, label: '학생 상담', color: 'bg-blue-500' },
              { id: 'parent', icon: Home, label: '학부모 상담', color: 'bg-amber-500' },
              { id: 'teacher', icon: BookOpen, label: '교사 의뢰', color: 'bg-purple-600' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id ? `${tab.color} text-white shadow-lg` : 'bg-white text-slate-500 hover:bg-slate-100'
                }`}
              >
                <tab.icon size={20} /> {tab.label}
              </button>
            ))}
          </div>
          
          {/* 체험 모드에서는 설정 버튼 숨김 (DB 접근 불가하므로) */}
          {db && (
            <div className="flex gap-2">
              <button onClick={() => setShowNotificationModal(true)} className="flex items-center gap-2 px-4 py-3 rounded-full font-bold bg-white text-indigo-500 border border-indigo-100 shadow-sm hover:bg-indigo-50 transition-colors">
                <Bell size={18} /> <span className="text-sm">알림 설정</span>
              </button>
              <button onClick={() => setShowPasswordModal(true)} className="flex items-center gap-2 px-4 py-3 rounded-full font-bold bg-white text-slate-500 border border-slate-200 shadow-sm hover:bg-slate-100 transition-colors">
                <Settings size={18} /> <span className="text-sm">비밀번호 설정</span>
              </button>
            </div>
          )}
          {!db && (
             <div className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center">
               ⚠️ 체험 모드 (데이터 저장 안됨)
             </div>
          )}
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 min-h-[500px]">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center p-2 rounded hover:bg-slate-200/50 transition-colors cursor-pointer" onClick={(e) => e.stopPropagation()}>
                <input 
                  type="checkbox" 
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={handleSelectAll}
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                  disabled={data.length === 0}
                />
              </div>
              <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${activeTab === 'student' ? 'bg-blue-500' : activeTab === 'parent' ? 'bg-amber-500' : 'bg-purple-600'}`}></span>
                신청 내역 ({data.length})
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {selectedIds.length > 0 && (
                !showBulkDeleteConfirm ? (
                  <button onClick={() => setShowBulkDeleteConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm">
                    <Trash2 size={16} /> 삭제 ({selectedIds.length})
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 px-2 py-1.5 rounded-xl animate-fade-in-up">
                    <button onClick={() => setShowBulkDeleteConfirm(false)} className="px-3 py-1.5 rounded-lg bg-white text-slate-500 text-xs font-bold border border-slate-200">취소</button>
                    <button onClick={executeBulkDelete} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold shadow-sm hover:bg-red-600">확인</button>
                  </div>
                )
              )}
              <button onClick={fetchData} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-blue-500">
                <Loader2 size={18} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
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
                <div key={item.id} className="group flex items-center hover:bg-slate-50 transition-colors">
                  <div className="pl-6 pr-4 py-6 flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(item.id)}
                      onChange={(e) => handleCheckboxChange(item.id, e)}
                      className="w-5 h-5 rounded border-slate-300 text-blue-600 cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="flex-1 py-6 pr-6 cursor-pointer flex items-center justify-between gap-4" onClick={() => setSelectedItem(item)}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${item.status === '상담완료' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {item.status || '접수대기'}
                        </span>
                        <span className="text-slate-400 text-xs flex items-center gap-1">
                          <Calendar size={12} />
                          {item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : '날짜 없음'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-800 truncate">
                        {item.name || item.childName || item.studentName}
                        <span className="text-sm font-medium text-slate-500 ml-2">{item.gradeClass}</span>
                      </h3>
                      <p className="text-slate-500 text-sm truncate mt-1">
                        {item.reason || item.worries || item.referralReason}
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                       <div className="p-2 bg-white border border-slate-200 rounded-full text-slate-400">
                         <ArrowRight size={20} />
                       </div>
                    </div>
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
      <PasswordSettingsModal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} />
      <NotificationSettingsModal isOpen={showNotificationModal} onClose={() => setShowNotificationModal(false)} />
    </div>
  );
};
