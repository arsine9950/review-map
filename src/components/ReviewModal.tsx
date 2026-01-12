import { useState } from 'react';
import { FaTimes, FaPen } from 'react-icons/fa';
import TransformerInput from './TransformerInput';
import './MainUI.css';

// ✅ [추가] 타입 정의
type SubRatingValue = 'good' | 'bad' | null;

interface ReviewModalProps {
  place: any;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ReviewModal = ({ place, onClose, onSubmit }: ReviewModalProps) => {
  const [placeName, setPlaceName] = useState(place.name);
  const [isEditingName, setIsEditingName] = useState(false);

  const [rating, setRating] = useState(3);
  const [text, setText] = useState('');
  const [selectedCat, setSelectedCat] = useState('식당');

  // ✅ [수정] useState에 제네릭 타입 명시 (<{ ... }>)
  const [subRatings, setSubRatings] = useState<{
    taste: SubRatingValue;
    atmosphere: SubRatingValue;
    cost: SubRatingValue;
    service: SubRatingValue;
    hygiene: SubRatingValue;
    access: SubRatingValue;
  }>({
    taste: null, 
    atmosphere: null, 
    cost: null, 
    service: null, 
    hygiene: null, 
    access: null
  });
  
  const [revisit, setRevisit] = useState(false);

  // 카테고리 목록
  const categories = [
    { id: '식당', label: '식당' },
    { id: '카페', label: '카페/디저트' },
    { id: '요리주점', label: '요리주점' },
    { id: '숙소', label: '숙소' },
    { id: '명소', label: '관광/명소' },
    { id: '자연', label: '자연/공원' },
  ];

  const handleSubmit = () => {
    onSubmit({
      placeName, 
      rating,
      text,
      selectedCat,
      subRatings,
      revisit
    });
  };

  return (
    <div className="ui-overlay" style={{ 
      background: 'rgba(0,0,0,0.6)', zIndex: 1200, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' 
    }}>
      <div style={{ 
        width: '100%', maxWidth: '400px', maxHeight: '85vh',
        background: 'white', borderRadius: '28px', 
        padding: '30px 24px', position: 'relative', overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column'
      }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '20px', color: '#ccc', cursor: 'pointer' }}>
          <FaTimes />
        </button>

        {/* 제목 수정 영역 */}
        <div style={{ textAlign: 'center', marginBottom: '6px' }}>
          {isEditingName ? (
            <input 
              autoFocus
              value={placeName}
              onChange={(e) => setPlaceName(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              style={{
                fontSize: '20px', fontWeight: 'bold', textAlign: 'center',
                border: 'none', borderBottom: '2px solid #3182F6', outline: 'none',
                width: '80%', padding: '4px', background: 'transparent'
              }}
            />
          ) : (
            <h2 
              onClick={() => setIsEditingName(true)}
              style={{ 
                margin: 0, fontSize: '22px', fontWeight: 'bold', color: '#333', 
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
              title="클릭해서 이름 수정"
            >
              {placeName} 
              <FaPen size={12} color="#aaa" />
            </h2>
          )}
          
          <p style={{ margin: '6px 0 0', fontSize: '12px', color: '#888' }}>{place.address}</p>
        </div>

        {/* 별점 */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: '40px', fontWeight: 'bold', color: '#3182F6', marginBottom: '8px' }}>
            {rating.toFixed(1)}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
             {[1, 2, 3, 4, 5].map((star) => (
               <span 
                 key={star} 
                 onClick={() => setRating(star)}
                 style={{ fontSize: '32px', cursor: 'pointer', color: star <= rating ? '#3182F6' : '#eee', transition: 'color 0.2s' }}
               >
                 ★
               </span>
             ))}
          </div>
          <input 
            type="range" min="1" max="5" step="0.5" 
            value={rating} 
            onChange={(e) => setRating(parseFloat(e.target.value))}
            style={{ width: '100%', marginTop: '16px', accentColor: '#3182F6' }}
          />
        </div>

        {/* 카테고리 */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '10px', display: 'block' }}>
            어떤 종류인가요? (필수)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                style={{
                  padding: '10px 0', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold',
                  background: selectedCat === cat.id ? '#333' : '#f5f5f5',
                  color: selectedCat === cat.id ? 'white' : '#888',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 상세 평가 (트랜스포머 버튼) */}
        {/* ✅ [수정] 타입 에러 해결: as any 제거하고 올바르게 전달 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '10px', display: 'block' }}>
            이 곳의 특징은? (선택)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
             <TransformerInput label="맛" value={subRatings.taste} onChange={(val) => setSubRatings({...subRatings, taste: val})} />
             <TransformerInput label="분위기" value={subRatings.atmosphere} onChange={(val) => setSubRatings({...subRatings, atmosphere: val})} />
             <TransformerInput label="가성비" value={subRatings.cost} onChange={(val) => setSubRatings({...subRatings, cost: val})} />
             <TransformerInput label="친절" value={subRatings.service} onChange={(val) => setSubRatings({...subRatings, service: val})} />
             <TransformerInput label="위생" value={subRatings.hygiene} onChange={(val) => setSubRatings({...subRatings, hygiene: val})} />
             <TransformerInput label="대기(줄)" value={subRatings.access} onChange={(val) => setSubRatings({...subRatings, access: val})} />
          </div>
        </div>

        {/* 한줄평 */}
        <div style={{ marginBottom: '20px' }}>
           <label style={{ fontSize: '13px', fontWeight: 'bold', color: '#333', marginBottom: '8px', display: 'block' }}>
            나만의 메모 (선택) 🔒
          </label>
          <textarea 
            placeholder="나만 볼 수 있는 간단한 메모를 남겨보세요."
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{
              width: '100%', height: '80px', padding: '12px', borderRadius: '12px',
              border: '1px solid #eee', background: '#f9f9f9', fontSize: '14px',
              resize: 'none', boxSizing: 'border-box', outline: 'none'
            }}
          />
        </div>

        {/* 재방문 의사 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', background: '#f8f9fa', padding: '12px 16px', borderRadius: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>🔄 다시 방문하고 싶나요?</span>
          <div 
             onClick={() => setRevisit(!revisit)}
             style={{ 
               width: '44px', height: '24px', borderRadius: '20px', 
               background: revisit ? '#3182F6' : '#ccc', position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
             }}
          >
             <div style={{
               width: '20px', height: '20px', background: 'white', borderRadius: '50%',
               position: 'absolute', top: '2px', left: revisit ? '22px' : '2px', transition: 'left 0.2s',
               boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
             }} />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          style={{
            width: '100%', padding: '16px', borderRadius: '16px', border: 'none',
            background: '#3182F6', color: 'white', fontSize: '16px', fontWeight: 'bold',
            cursor: 'pointer', boxShadow: '0 4px 12px rgba(49, 130, 246, 0.3)'
          }}
        >
          기록 저장하기
        </button>

      </div>
    </div>
  );
};

export default ReviewModal;