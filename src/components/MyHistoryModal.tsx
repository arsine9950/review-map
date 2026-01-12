import { FaTimes, FaMapMarkerAlt, FaStar, FaTrash } from 'react-icons/fa';
import { db, auth } from '../firebase';
import { doc, writeBatch } from 'firebase/firestore';
import './Modal.css';

interface MyHistoryModalProps {
  reviews: any[];
  onClose: () => void;
  onReviewClick: (review: any) => void;
  onDelete: (reviewId: string) => void;
}

const MyHistoryModal = ({ reviews, onClose, onReviewClick, onDelete }: MyHistoryModalProps) => {

  const getLabel = (key: string) => {
    const map: Record<string, string> = { 
      taste: '맛', cost: '가성비', service: '친절', mood: '분위기', atmosphere: '분위기',
      hygiene: '위생', access: '대기' 
    };
    return map[key] || key;
  };

  const handleClearAllData = async () => {
    const user = auth.currentUser;
    if (!user) return;
    if (!window.confirm("⚠️ 모든 기록을 삭제하고 초기화하시겠습니까?\n(되돌릴 수 없습니다!)")) return;

    try {
      const batch = writeBatch(db);
      reviews.forEach((review) => {
        const reviewRef = doc(db, "reviews", review.id);
        batch.delete(reviewRef);
      });
      const userRef = doc(db, "users", user.uid);
      batch.update(userRef, {
        exp: 0, level: 1, title: '🍿 방구석 1열', availableTitles: ['🍿 방구석 1열'], achievements: [] 
      });
      await batch.commit();
      alert("초기화되었습니다.");
      window.location.reload(); 
    } catch (e) {
      console.error(e);
      alert("오류가 발생했습니다.");
    }
  };

  // 개별 삭제 핸들러
  const handleDeleteItem = (e: React.MouseEvent, reviewId: string) => {
    e.stopPropagation(); 
    if (window.confirm("이 기록을 삭제하시겠습니까?")) {
        onDelete(reviewId);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        
        {/* 헤더 */}
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
            📜 내 리뷰 기록 ({reviews.length})
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#999', padding: '4px' }}>
            <FaTimes />
          </button>
        </div>

        {/* 리스트 영역 */}
        <div className="modal-body">
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', marginTop: '60px', color: '#888' }}>
              <p style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '8px' }}>텅 비어있어요!</p>
              <p style={{ fontSize: '13px' }}>지도를 눌러 첫 리뷰를 남겨보세요. 🚩</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div 
                key={review.id} 
                className="history-card"
                // ✅ [수정] 카드 전체 패딩 제거하고 Flex 레이아웃 적용
                style={{ display: 'flex', padding: 0, overflow: 'hidden' }}
              >
                
                {/* 1. 왼쪽: 내용 영역 (클릭 시 상세 이동) */}
                <div 
                  style={{ flex: 1, padding: '16px', cursor: 'pointer' }}
                  onClick={() => onReviewClick(review)}
                >
                    {/* 상단: 이름 + 날짜 */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>
                            {review.placeName}
                        </span>
                        <span style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                            {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* 카테고리 + 별점 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#555', marginBottom: '10px' }}>
                        <span style={{ background: '#f0f4ff', color: '#3182F6', padding: '3px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                        {review.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', color: '#FFD700' }}>
                        <FaStar size={12} /> <span style={{ color: '#555', marginLeft: '2px', fontSize: '12px', fontWeight: 'bold' }}>{review.rating}</span>
                        </div>
                    </div>

                    {/* 태그 목록 */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                        {review.subRatings && Object.entries(review.subRatings).map(([key, val]) => {
                            if (!val) return null;
                            const label = getLabel(key);
                            const isGood = val === 'good';
                            return (
                            <span key={key} style={{ 
                                fontSize: '10px', 
                                color: isGood ? '#3182F6' : '#FF6B6B', 
                                background: isGood ? '#e8f3ff' : '#fff0f0', 
                                padding: '2px 6px', borderRadius: '8px', fontWeight: 'bold' 
                            }}>
                                {isGood ? '👍' : '👎'} {label}
                            </span>
                            );
                        })}
                    </div>

                    {/* 한줄평 */}
                    {review.content && (
                        <p style={{ 
                            fontSize: '13px', color: '#555', margin: '0 0 10px 0', 
                            background: '#f8f9fa', padding: '8px', borderRadius: '8px',
                            lineHeight: '1.4'
                        }}>
                        {review.content}
                        </p>
                    )}

                    {/* 주소 */}
                    <div style={{ fontSize: '11px', color: '#bbb', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <FaMapMarkerAlt size={10} /> {review.address}
                    </div>
                </div>

                {/* 2. 오른쪽: 삭제 버튼 (빨간 영역) */}
                <div 
                    onClick={(e) => handleDeleteItem(e, review.id)}
                    style={{ 
                        width: '55px', 
                        background: '#fff0f0', 
                        borderLeft: '1px solid #ffe0e0',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        color: '#ff6b6b', cursor: 'pointer', flexShrink: 0
                    }}
                    title="삭제"
                >
                    <FaTrash size={16} style={{ marginBottom: '4px' }} />
                    <span style={{ fontSize: '11px', fontWeight: 'bold' }}>삭제</span>
                </div>

              </div>
            ))
          )}
        </div>

        {/* 하단 전체 초기화 버튼 */}
        <div className="modal-footer">
            <button 
                onClick={handleClearAllData}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #ffebeb',
                    background: '#fff5f5',
                    color: '#ff4444',
                    fontWeight: 'bold',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
            >
                <FaTrash size={12} /> 모든 기록 삭제 및 초기화
            </button>
        </div>

      </div>
    </div>
  );
};

export default MyHistoryModal;