import React, { useState, useEffect } from 'react';
import { X, Bell, Save, Loader2, Link as LinkIcon, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationConfig } from '../types';

interface NotificationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({ isOpen, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSettings();
      setMessage(null);
    }
  }, [isOpen]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const docRef = doc(db, 'config', 'notifications');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as NotificationConfig;
        setWebhookUrl(data.webhookUrl || '');
        setIsEnabled(data.isEnabled || false);
      } else {
        setWebhookUrl('');
        setIsEnabled(false);
      }
    } catch (error: any) {
      console.error("Error fetching settings:", error);
      setMessage({ text: "설정을 불러오지 못했습니다.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'notifications'), {
        webhookUrl: webhookUrl.trim(),
        isEnabled: isEnabled
      });
      setMessage({ text: "알림 설정이 저장되었습니다.", type: 'success' });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      if (error.code === 'permission-denied') {
        setMessage({ 
          text: "저장 실패: 관리자 권한이 필요합니다.", 
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
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-indigo-50">
            <Bell size={32} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">디스코드 알림 설정</h2>
          <p className="text-slate-500 mt-2 text-sm">
            상담 신청이 들어오면<br/>디스코드 채널로 알림을 보냅니다.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            {/* Toggle Switch */}
            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <span className="font-bold text-slate-700">알림 켜기</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                />
                <div className="w-14 h-7 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">디스코드 웹훅 URL</label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 text-slate-400" size={18} />
                <input
                  type="text" 
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-400 focus:ring-4 focus:ring-indigo-50 outline-none transition-all text-sm"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 ml-1">
                * 디스코드 채널 편집 {'>'} 연동 {'>'} 웹훅 만들기에서 URL을 복사하세요.
              </p>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 ${
                message.type === 'success' ? 'bg-green-50 text-green-600' : 
                message.type === 'warning' ? 'bg-orange-50 text-orange-600' :
                'bg-red-50 text-red-500'
              }`}>
                {message.type === 'success' && <CheckCircle2 size={16} />}
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