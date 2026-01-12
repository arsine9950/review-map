import { useState } from 'react';
import { FaTimes, FaStar } from 'react-icons/fa';
import './MainUI.css';

interface ReviewModalProps {
  place: { name: string; address: string; category: string };
  onClose: () => void;
  onSubmit: (data: any) => void;
}

const ReviewModal = ({ place, onClose, onSubmit }: ReviewModalProps) => {
  const [rating, setRating] = useState(3.0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 기획안 반영 상태
  const [selectedCat, setSelectedCat] = useState(''); 
  const [revisit, setRevisit] = useState(false); 
  const [subRatings, setSubRatings] = useState({ 
    taste: 0, atmosphere: 0, cost: 0, service: 0, hygiene: 0, access: 0
  });

  const categories = [
    { id: '식당', label: '식당', enabled: true },
    { id: '카페', label: '카페/디저트', enabled: true },
    { id: '술집', label: '술집', enabled: true },
    { id: '숙소', label: '숙소', enabled: false },
    { id: '명소', label: '관광/명소', enabled: false },
    { id: '자연', label: '자연/공원', enabled: false },
    { id: '편의', label: '생활/편의', enabled: false },
    { id: '문화', label: '문화/축제', enabled: false },
    { id: '레저', label: '레저/스포츠', enabled: false },
  ];

  const subItems = [
    { id: 'taste', label: '맛' },
    { id: 'atmosphere', label: '분위기' },
    { id: 'cost', label: '가성비' },
    { id: 'service', label: '친절' },
    { id: 'hygiene', label: '위생' },
    { id: 'access', label: '접근성' },
  ];

  const emojis = ["😫", "😐", "🙂", "😋", "🤩"];

  const handleCatClick = (cat: any) => {
    if (!cat.enabled) {
      alert("추후 확장 예정입니다.");
      return;
    }
    setSelectedCat(cat.id);
  };

  const handleSubRating = (itemId: string, score: number) => {
    setSubRatings(prev => ({ 
      ...prev, 
      [itemId]: (prev as any)[itemId] === score ? 0 : score 
    }));
  };

  const handleSubmit = () => {
    if (!selectedCat) {
      alert("장소의 종류를 선택해주세요! (필수)");
      return;
    }
    
    setLoading(true);
    onSubmit({ text, rating, selectedCat, subRatings, revisit });
  };

  return (
    <div className="ui-overlay" style={{ 
      background: 'rgba(0,0,0,0.5)', zIndex: 300, pointerEvents: 'auto',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div style={{ 
        width: '100%', maxWidth: '450px', maxHeight: '90vh', overflowY: 'auto',
        background: 'white', borderRadius: '28px', padding: '30px',
        boxShadow: '0 15px 35px rgba(0,0,0,0.2)', position: 'relative'
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#ccc' }}><FaTimes /></button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          {/* 장소 이름 앞뒤 빨간 점 및 빨간 밑줄 */}
          <h2 style={{ 
            fontSize: '19px', 
            fontWeight: 'bold', 
            margin: '0 0 6px', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center' 
          }}>
            <span style={{ display: 'block', width: '6px', height: '6px', backgroundColor: 'red', borderRadius: '50%', marginRight: '8px' }}></span>
            <span style={{ textDecoration: 'underline', textDecorationColor: 'red', textUnderlineOffset: '3px' }}>
              {place.name}
            </span>
            <span style={{ display: 'block', width: '6px', height: '6px', backgroundColor: 'red', borderRadius: '50%', marginLeft: '8px' }}></span>
          </h2>
          <p style={{ fontSize: '13px', color: '#999', margin: 0 }}>{place.address}</p>
        </div>

        {/* 별점 게이지 섹션 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#3182F6', marginBottom: '8px' }}>{rating.toFixed(1)}</div>
          
          <div style={{ 
            position: 'relative', 
            display: 'inline-flex', 
            fontSize: '36px', 
            lineHeight: 1
          }}>
            {/* 1층: 배경 (회색 빈 별) */}
            <div style={{ color: '#E5EAF2', display: 'flex', gap: '4px' }}>
              {[1, 2, 3, 4, 5].map(v => (
                <FaStar key={v} style={{ flexShrink: 0 }} />
              ))}
            </div>
            
            {/* 2층: 파란색 게이지 */}
            <div style={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              color: '#3182F6', 
              overflow: 'hidden', 
              width: `${(rating / 5) * 100}%`, 
              whiteSpace: 'nowrap',
              display: 'flex',
              gap: '4px',
              transition: 'width 0.1s ease-out',
              pointerEvents: 'none'
            }}>
              {[1, 2, 3, 4, 5].map(v => (
                <FaStar key={v} style={{ flexShrink: 0 }} />
              ))}
            </div>
          </div>

          <input 
            type="range" 
            min="1.0" 
            max="5.0" 
            step="0.5" 
            value={rating} 
            onChange={(e) => setRating(parseFloat(e.target.value))}
            style={{ width: '90%', marginTop: '20px', cursor: 'pointer', accentColor: '#3182F6' }}
          />
        </div>

        {/* 카테고리 선택 (필수) */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>어떤 종류인가요? (필수)</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCatClick(cat)}
                style={{
                  padding: '10px 4px', 
                  borderRadius: '12px', 
                  fontSize: '12px',
                  // ✅ [수정] 활성화된 항목의 테두리를 더 진하게(#999) 변경, 선택시 파란색
                  border: selectedCat === cat.id 
                    ? '1px solid #3182F6' 
                    : (cat.enabled ? '1px solid #999' : '1px solid #eee'),
                  background: selectedCat === cat.id ? '#3182F6' : '#f9f9f9',
                  // ✅ [수정] 활성화된 항목 글자색도 조금 더 진하게(#333) 변경
                  color: selectedCat === cat.id ? 'white' : (cat.enabled ? '#333' : '#ccc'),
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* 세부 평가 (이모지) */}
        <div style={{ textAlign: 'left', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>세부 평가(선택)</p>
          {subItems.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', color: '#666', width: '60px' }}>{item.label}</span>
              <div style={{ display: 'flex', gap: '12px' }}>
                {emojis.map((emoji, idx) => (
                  <span
                    key={idx}
                    onClick={() => handleSubRating(item.id, idx + 1)}
                    style={{ 
                      fontSize: '22px', cursor: 'pointer', 
                      filter: (subRatings as any)[item.id] === idx + 1 ? 'none' : 'grayscale(100%)',
                      opacity: (subRatings as any)[item.id] === idx + 1 ? 1 : 0.3
                    }}
                  >
                    {emoji}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 한 줄 평 (모든 점수에서 선택 사항) */}
        <div style={{ textAlign: 'left', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>기록 <span style={{ color: '#888' }}>(선택)</span></span>
            <span style={{ fontSize: '12px', color: '#bbb' }}>{text.length}/50</span>
          </div>
          <textarea 
            placeholder="이 장소에 대한 한줄평을 남겨보세요"
            value={text} onChange={(e) => setText(e.target.value)} maxLength={50}
            style={{ width: '100%', height: '80px', padding: '15px', borderRadius: '15px', border: '1px solid #f0f0f0', fontSize: '14px', resize: 'none', background: '#fcfcfc' }}
          />
        </div>

        {/* 재방문 체크 */}
        <div style={{ textAlign: 'left', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" id="revisit" checked={revisit} onChange={(e) => setRevisit(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
          <label htmlFor="revisit" style={{ fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', color: '#444' }}>재방문 의사 있음</label>
        </div>

        <button 
          onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '18px', borderRadius: '18px', border: 'none', background: '#3182F6', color: 'white', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? '저장 중...' : '기록 남기기'}
        </button>
      </div>
    </div>
  );
};

export default ReviewModal;