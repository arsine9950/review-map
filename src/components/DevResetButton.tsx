import { db } from '../firebase';
import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';

interface DevResetButtonProps {
  userId: string;
}

const DevResetButton = ({ userId }: DevResetButtonProps) => {

  // 데이터 전체 초기화 함수
  const handleResetData = async () => {
    const confirmMsg = "⚠️ [개발자 모드] 경고 ⚠️\n\n모든 리뷰 데이터가 영구 삭제되고\n내 레벨과 업적이 1레벨로 초기화됩니다.\n\n정말 진행하시겠습니까?";
    if (!window.confirm(confirmMsg)) return;

    // 한번 더 물어보기 (안전을 위해)
    if (!window.confirm("진짜로 지웁니다? 돌이킬 수 없습니다!")) return;

    try {
      const batch = writeBatch(db);
      
      // 1. 모든 리뷰 가져와서 삭제 대기
      const reviewsSnapshot = await getDocs(collection(db, "reviews"));
      reviewsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // 2. 내 계정 정보 초기화 (Lv.1로 리셋)
      if (userId) {
        const userRef = doc(db, "users", userId);
        batch.update(userRef, {
          exp: 0,
          level: 1,
          title: '🍿 방구석 1열', // 초기 칭호
          availableTitles: ['🍿 방구석 1열'],
          achievements: [] // 업적 초기화
        });
      }

      // 3. 실행 (Batch Commit)
      await batch.commit();

      alert("♻️ 모든 데이터가 리셋되었습니다.\n새로고침합니다.");
      window.location.reload();

    } catch (e) {
      console.error("초기화 실패:", e);
      alert("초기화 중 오류가 발생했습니다.");
    }
  };

  return (
    <button 
      onClick={handleResetData}
      style={{
        position: 'absolute',
        bottom: '100px', // 다른 버튼들 위에 배치
        left: '20px',
        zIndex: 9999,
        background: '#FF4444',
        color: 'white',
        border: '2px solid white',
        boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
        padding: '10px 16px',
        borderRadius: '30px',
        fontSize: '13px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
    >
      💣 데이터 초기화
    </button>
  );
};

export default DevResetButton;