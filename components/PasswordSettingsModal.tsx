import React, { useState, useEffect } from 'react';
import { X, Lock, Save, Loader2, KeyRound, AlertTriangle } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface PasswordSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PasswordSettingsModal: React.FC<PasswordSettingsModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchCurrentPassword();
      setMessage(null);
    }
  }, [isOpen]);

  const fetchCurrentPassword = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'config', 'teacher_auth');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setPassword(docSnap.data().password || '2580');
      } else {
        setPassword('2580'); // Default fallback
      }
    } catch (error: any) {
      console.error("Error fetching password:", error);
      if (error.code === 'permission-denied') {
        setMessage({ 
          text: "권한 오류: Firestore 보안 규칙을 확인해주세요.", 
          type: 'warning' 
        });
        setPassword('2580'); // Fallback to allow UI to render
      } else {
        setMessage({ text: "비밀번호를 불러오지 못했습니다.", type: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setMessage({ text: "비밀번호를 입력해주세요.", type: 'error' });
      return;
    }

    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'teacher_auth'), {
        password: password.trim()
      });
      setMessage({ text: "비밀번호가 변경되었습니다.", type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving password:", error);
      if (error.code === 'permission-denied') {
        setMessage({ 
          text: "저장 실패: 관리자 쓰기 권한이 없습니다.", 
          type: 'error' 
        });
      } else {
        setMessage({ text: "저장 중 오류가 발생했습니다.", type: 'error' });
      }
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 animate-bounce-in z-10">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 p-2 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-slate-50">
            <KeyRound size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">교사 의뢰 비밀번호 설정</h2>
          <p className="text-slate-500 mt-2 text-sm">
            선생님이 의뢰서 작성 페이지에 접속할 때<br/>사용할 비밀번호를 설정합니다.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-blue-500" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">비밀번호</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50 outline-none transition-all font-mono text-lg tracking-wider"
                  placeholder="예: 2580"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-600' : 
                message.type === 'warning' ? 'bg-orange-50 text-orange-600' :
                'bg-red-50 text-red-500'
              }`}>
                {message.type === 'warning' && <AlertTriangle size={16} />}
                {message.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? '저장 중...' : '설정 저장하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};