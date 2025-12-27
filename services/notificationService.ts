
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { NotificationConfig } from '../types';

type ApplicationType = 'student' | 'parent' | 'teacher';

export const sendNotification = async (type: ApplicationType, data: any) => {
  try {
    // 1. 설정 가져오기
    const docRef = doc(db, 'config', 'notifications');
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return; // 설정이 없으면 중단

    const config = docSnap.data() as NotificationConfig;

    if (!config.isEnabled || !config.webhookUrl) return; // 비활성화 상태거나 URL이 없으면 중단

    // 2. 메시지 내용 구성
    let title = '';
    let description = '';
    let color = 0; // Decimal color code

    // Helper to safely get string
    const safeStr = (val: any, limit: number = 200) => {
      if (!val) return '내용 없음';
      const str = String(val);
      return str.length > limit ? str.substring(0, limit) + '...' : str;
    };

    if (type === 'student') {
      title = '😊 학생 상담 신청이 도착했습니다!';
      description = `**이름:** ${safeStr(data.name)}\n**학년/반:** ${safeStr(data.gradeClass)}\n**신청 사유:** ${safeStr(data.reason)}`;
      color = 3447003; // Blue
    } else if (type === 'parent') {
      title = '🏠 학부모 상담 신청이 도착했습니다!';
      description = `**자녀 이름:** ${safeStr(data.childName)}\n**신청자:** ${safeStr(data.relation)}\n**연락처:** ${safeStr(data.contact)}\n**걱정되는 점:** ${safeStr(data.worries)}`;
      color = 15844367; // Amber/Yellow
    } else if (type === 'teacher') {
      title = '🏫 교사 상담 의뢰가 도착했습니다!';
      description = `**학생 이름:** ${safeStr(data.studentName)}\n**학년/반:** ${safeStr(data.gradeClass)}\n**의뢰 사유:** ${safeStr(data.referralReason)}`;
      color = 9327824; // Purple
    }

    const payload = {
      embeds: [
        {
          title: title,
          description: description,
          color: color,
          timestamp: new Date().toISOString(),
          footer: {
            text: "Wee Class 알림 시스템"
          }
        }
      ]
    };

    // 3. 디스코드 웹훅 전송 (CORS 우회: FormData + no-cors)
    // 브라우저에서 직접 디스코드 웹훅을 호출할 때 발생하는 CORS 문제를 해결하기 위해
    // application/json 헤더를 사용하는 대신 FormData의 payload_json 필드를 사용합니다.
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(payload));

    // console.log("Sending Discord Notification...", config.webhookUrl);

    await fetch(config.webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors', // 응답을 확인하지 않음으로써 CORS 차단을 우회합니다.
      body: formData,
    });

  } catch (error) {
    console.error("Failed to send notification:", error);
    // 알림 전송 실패가 신청서 제출 실패로 이어지지 않도록 에러는 콘솔에만 기록하고 무시합니다.
  }
};
