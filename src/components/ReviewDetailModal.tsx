import { useMemo, useState } from 'react';
import { FaTimes, FaStar, FaCircle, FaThumbsUp, FaTrash } from 'react-icons/fa';
import VisualTag from './VisualTag'; // ✅ VisualTag import 필수!
import './MainUI.css';

interface ReviewDetailModalProps {
  reviews: any[];
  onClose: () => void;
  onDelete?: (reviewId: string) => void;
  currentUser?: string;
  currentUserId?: string;
}

const ReviewDetailModal = ({ reviews, onClose, onDelete, currentUser = '', currentUserId }: ReviewDetailModalProps) => {
  const [sortType, setSortType] = useState<'latest' | 'likes'>('latest');

  // 기본 정보
  const placeInfo = reviews[0] || {};
  const totalReviews = reviews.length;

  // ✅ 1. 통계 계산 (점수 분포 -> good/bad 카운트로 변경)
  const stats = useMemo(() => {
    let ratingSum = 0;
    let revisitCount = 0;
    
    // 카테고리별 개수
    const catCounts: Record<string, number> = {};
    
    // 항목별 good/bad 개수 (맛, 가성비, 친절, 분위기) - 기존 위생, 대기는 제외됨
    const subStats = {
      taste: { good: 0, bad: 0 },
      cost: { good: 0, bad: 0 },
      service: { good: 0, bad: 0 },
      mood: { good: 0, bad: 0 }
    };

    reviews.forEach((r) => {
      ratingSum += r.rating;
      if (r.revisit) revisitCount++;
      
      const cat = r.category;
      if (cat) catCounts[cat] = (catCounts[cat] || 0) + 1;

      // subRatings 집계
      if (r.subRatings) {
        // taste
        if (r.subRatings.taste === 'good') subStats.taste.good++;
        if (r.subRatings.taste === 'bad') subStats.taste.bad++;
        // cost
        if (r.subRatings.cost === 'good') subStats.cost.good++;
        if (r.subRatings.cost === 'bad') subStats.cost.bad++;
        // service
        if (r.subRatings.service === 'good') subStats.service.good++;
        if (r.subRatings.service === 'bad') subStats.service.bad++;
        // mood (atmosphere -> mood로 매핑 필요할 수 있음. 일단 mood로 가정)
        // 만약 DB에 atmosphere로 저장했다면 아래 키를 atmosphere로 수정하세요.
        const moodVal = r.subRatings.mood || r.subRatings.atmosphere; 
        if (moodVal === 'good') subStats.mood.good++;
        if (moodVal === 'bad') subStats.mood.bad++;
      }
    });

    // 가장 많이 나온 카테고리 찾기
    let maxCat = '';
    let maxVal = 0;
    Object.entries(catCounts).forEach(([key, val]) => {
      if (val > maxVal) { maxVal = val; maxCat = key; }
    });

    return {
      avgRating: totalReviews > 0 ? (ratingSum / totalReviews).toFixed(1) : '0.0',
      revisitCount,
      topCategory: maxCat,
      subStats
    };
  }, [reviews, totalReviews]);

  // 2. 정렬 로직
  const sortedReviews = useMemo(() => {
    const copied = [...reviews];
    if (sortType === 'latest') {
      return copied.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      return copied.sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0));
    }
  }, [reviews, sortType]);

  const categories = [
    { id: '식당', label: '식당' },
    { id: '카페', label: '카페' },
    { id: '요리주점', label: '주점' },
    { id: '숙소', label: '숙소' },
    { id: '명소', label: '명소' },
    { id: '자연', label: '자연' },
  ];

  const handleDeleteClick = (reviewId: string) => {
    if (window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      if (onDelete) onDelete(reviewId);
      else alert("삭제 기능이 연결되지 않았습니다.");
    }
  };

  const renderStyledNickname = (fullNickname: string) => {
    if (!fullNickname) return <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>알 수 없음</span>;
    const lastSpaceIdx = fullNickname.lastIndexOf(' ');
    if (lastSpaceIdx === -1) return <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{fullNickname}</span>;
    
    const name = fullNickname.substring(0, lastSpaceIdx);
    let tag = fullNickname.substring(lastSpaceIdx + 1);
    if (!tag.startsWith('#')) tag = '#' + tag;

    return (
      <div style={{ display: 'flex', alignItems: 'baseline' }}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#333' }}>{name}</span>
        <span style={{ fontSize: '12px', color: '#aaa', marginLeft: '4px', fontWeight: 'normal' }}>{tag}</span>
      </div>
    );
  };

  return (
    <div className="ui-overlay" style={{ 
      background: 'rgba(0,0,0,0.6)', zIndex: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ 
        width: '90%', maxWidth: '950px', 
        height: '70vh', 
        background: 'white', borderRadius: '28px', 
        display: 'flex', overflow: 'hidden', position: 'relative',
        boxShadow: '0 15px 40px rgba(0,0,0,0.3)'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#ccc', zIndex: 50 }}>
          <FaTimes />
        </button>

        {/* ================= 왼쪽 패널 (통계) ================= */}
        <div style={{ width: '35%', padding: '40px 30px', borderRight: '1px solid #eee', overflowY: 'auto', background: '#fff' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <FaCircle color="#F44336" size={6} />
              <h2 style={{ fontSize: '22px', fontWeight: 'bold', margin: 0, borderBottom: '3px solid #F44336', lineHeight: 1.2 }}>
                {placeInfo.placeName || '장소명 없음'}
              </h2>
              <FaCircle color="#F44336" size={6} />
            </div>
            <p style={{ fontSize: '13px', color: '#888', margin: 0 }}>{placeInfo.address || ''}</p>
          </div>

          {/* 별점 평균 */}
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '48px', fontWeight: '900', color: '#3182F6', lineHeight: 1 }}>
              {stats.avgRating}
              <span style={{ fontSize: '16px', color: '#999', fontWeight: 'normal', marginLeft: '8px' }}>
                ({totalReviews}명)
              </span>
            </div>
            
            <div style={{ position: 'relative', display: 'inline-block', marginTop: '6px' }}>
              <div style={{ display: 'flex', gap: '4px', color: '#E5EAF2' }}>
                {[1, 2, 3, 4, 5].map(v => <FaStar key={v} size={30} />)}
              </div>
              <div style={{ 
                position: 'absolute', top: 0, left: 0, 
                width: `${(parseFloat(stats.avgRating) / 5) * 100}%`, 
                overflow: 'hidden', whiteSpace: 'nowrap'
              }}>
                 <div style={{ display: 'flex', gap: '4px', color: '#3182F6', width: 'max-content' }}>
                   {[1, 2, 3, 4, 5].map(v => <FaStar key={v} size={30} />)}
                 </div>
              </div>
            </div>
          </div>

          {/* 카테고리 뱃지 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '30px' }}>
            {categories.map(cat => {
              const isActive = stats.topCategory === cat.id; // 단순 비교 (포함 여부 아님)
              return (
                <div key={cat.id} style={{
                  padding: '8px 0', textAlign: 'center', fontSize: '12px', borderRadius: '10px',
                  background: isActive ? '#3182F6' : '#fff', 
                  border: isActive ? '1px solid #3182F6' : '1px solid #eee', 
                  color: isActive ? 'white' : '#888', 
                  fontWeight: isActive ? 'bold' : 'normal'
                }}>
                  {cat.label}
                </div>
              );
            })}
          </div>

          {/* ✅ [변경] VisualTag 통계 그래프 */}
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ fontSize: '14px', color: '#333', marginBottom: '12px' }}>📊 유저 평가 요약</h4>
            <VisualTag label="맛" goodCount={stats.subStats.taste.good} badCount={stats.subStats.taste.bad} />
            <VisualTag label="가성비" goodCount={stats.subStats.cost.good} badCount={stats.subStats.cost.bad} />
            <VisualTag label="친절" goodCount={stats.subStats.service.good} badCount={stats.subStats.service.bad} />
            <VisualTag label="분위기" goodCount={stats.subStats.mood.good} badCount={stats.subStats.mood.bad} />
          </div>

          <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', fontWeight: 'normal' }}>
            🔄 재방문 의사: <b>{stats.revisitCount}명</b>
          </div>
        </div>

        {/* ================= 오른쪽 패널 (리스트) ================= */}
        <div style={{ width: '65%', background: '#fafafa', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ padding: '30px 30px 15px', background: '#fafafa', display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
            <span style={{ fontWeight: 'bold', fontSize: '18px', color: '#333' }}>총 {totalReviews}개의 기록</span>
            
            <div style={{ display: 'flex', gap: '8px', marginRight: '40px' }}>
              <button onClick={() => setSortType('latest')} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: sortType === 'latest' ? 'bold' : 'normal', color: sortType === 'latest' ? '#333' : '#aaa', cursor: 'pointer' }}>최신순</button>
              <div style={{ width: '1px', height: '12px', background: '#ddd', alignSelf: 'center' }}></div>
              <button onClick={() => setSortType('likes')} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: sortType === 'likes' ? 'bold' : 'normal', color: sortType === 'likes' ? '#333' : '#aaa', cursor: 'pointer' }}>좋아요순</button>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '0 30px 30px' }}>
            {sortedReviews.map((review) => {
              
              const isMine = (currentUserId && review.userId === currentUserId) ||
                             (currentUser && review.nickname === currentUser); 

              return (
                <div key={review.id} style={{ 
                  background: 'white', borderRadius: '16px', marginBottom: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0',
                  display: 'flex', overflow: 'hidden'
                }}>
                  
                  {/* 별점 박스 */}
                  <div style={{ 
                    width: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
                    borderRight: '1px solid #f5f5f5', background: '#fdfdfd' 
                  }}>
                    <FaStar size={18} color="#FFD700" style={{ marginBottom: '4px' }} />
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{review.rating}</span>
                  </div>

                  <div style={{ flex: 1, padding: '16px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    
                    {/* 상단 정보 (레벨, 닉네임, 날짜) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '10px', background: '#3182F6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        Lv.{review.userLevel || 1}
                      </span>
                      {renderStyledNickname(review.nickname)}
                      <span style={{ fontSize: '12px', color: '#aaa' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>

                    {/* 내용 (내 글만 보임) */}
                    {isMine && review.content ? (
                        <div style={{ 
                            fontSize: '14px', color: '#333', marginBottom: '8px', lineHeight: '1.5',
                            background: '#eef6ff', padding: '10px', borderRadius: '8px'
                        }}>
                          <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#3182F6', display: 'block', marginBottom: '4px' }}>
                            🔒 나만의 메모
                          </span>
                          {review.content}
                        </div>
                      ) : (
                        // 남의 글은 내용 숨김 (빈 공간 유지 안함)
                        null
                    )}

                    {/* ✅ [변경] 개별 리뷰 태그 표시 (good/bad) */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {review.subRatings && Object.entries(review.subRatings).map(([key, val]) => {
                        if (!val) return null; // null이면 표시 안 함
                        
                        // 키 매핑 (DB 키 -> 화면 텍스트)
                        const labelMap: Record<string, string> = { taste: '맛', cost: '가성비', service: '친절', mood: '분위기', atmosphere: '분위기' };
                        const label = labelMap[key];
                        if (!label) return null;

                        const isGood = val === 'good';
                        return (
                          <span key={key} style={{ 
                            fontSize: '11px', 
                            color: isGood ? '#3182F6' : '#FF6B6B', 
                            background: isGood ? '#e8f3ff' : '#fff0f0', 
                            padding: '4px 8px', borderRadius: '12px', fontWeight: 'bold' 
                          }}>
                            {isGood ? '👍' : '👎'} {label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* 삭제/좋아요 버튼 */}
                  {isMine ? (
                    <button 
                      style={{ 
                        width: '50px', border: 'none', borderLeft: '1px solid #f0f0f0', background: '#fff0f0',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#ff4d4f', transition: 'background 0.2s'
                      }}
                      onClick={() => handleDeleteClick(review.id)}
                    >
                      <FaTrash size={16} />
                      <span style={{ fontSize: '10px', marginTop: '4px', fontWeight: 'bold' }}>삭제</span>
                    </button>
                  ) : (
                    <button 
                      style={{ 
                        width: '50px', border: 'none', borderLeft: '1px solid #f0f0f0', background: 'white',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#ccc'
                      }}
                      onClick={() => alert('좋아요 기능은 준비 중입니다!')}
                    >
                      <FaThumbsUp size={18} />
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewDetailModal;