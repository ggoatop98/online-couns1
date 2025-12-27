
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";

/**
 * 🛠 환경 변수 안전하게 가져오기 (공백 제거 및 'undefined' 문자열 체크 강화)
 */
const getSafeEnv = (key: string): string | undefined => {
  let value: any = undefined;

  try {
    // 1. Vite 환경 (import.meta.env)
    if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
      value = (import.meta as any).env[key];
    }
  } catch (e) {}

  if (!value) {
    try {
      // 2. Node/Global 환경 (process.env)
      const env = (window as any).process?.env || (typeof process !== 'undefined' ? process.env : undefined);
      value = env ? env[key] : undefined;
    } catch (e) {}
  }

  // 값이 문자열 "undefined" 이거나 빈 공백인 경우 실제 undefined로 처리
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed === '' || trimmed === 'undefined') return undefined;
    return trimmed;
  }

  return value;
};

const firebaseConfig = {
  apiKey: getSafeEnv('VITE_FIREBASE_API_KEY') || getSafeEnv('FIREBASE_API_KEY'),
  authDomain: getSafeEnv('VITE_FIREBASE_AUTH_DOMAIN') || getSafeEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getSafeEnv('VITE_FIREBASE_PROJECT_ID') || getSafeEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getSafeEnv('VITE_FIREBASE_STORAGE_BUCKET') || getSafeEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getSafeEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || getSafeEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getSafeEnv('VITE_FIREBASE_APP_ID') || getSafeEnv('FIREBASE_APP_ID')
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let isFirebaseConfigured = false;

// API Key가 실제로 유효한 문자열일 때만 초기화
if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    isFirebaseConfigured = true;
    console.log("✅ Firebase가 성공적으로 연결되었습니다.");
  } catch (error) {
    console.error("🚨 Firebase 초기화 중 오류 발생:", error);
  }
} else {
  console.warn("⚠️ Firebase API Key가 유효하지 않거나 설정되지 않았습니다.");
}

export { db, auth, isFirebaseConfigured };
export default app;
