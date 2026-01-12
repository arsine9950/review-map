import { FaSearch, FaPen } from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';

interface GuideModalProps {
  onClose: () => void;
}

const GuideModal = ({ onClose }: GuideModalProps) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.6)', // 배경을 어둡게 눌러줌
      zIndex: 2000, // 지도보다 위에 뜨도록 높게 설정
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px', boxSizing: 'border-box'
    }}>
      <div style={{
        width: '100%', maxWidth: '340px',
        background: 'white', // ✅ 배경 흰색 확실하게 지정
        borderRadius: '24px',
        padding: '30px 24px',
        textAlign: 'center',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)', // ✅ 그림자를 진하게 넣어서 붕 뜬 느낌
        border: '2px solid #3182F6', // ✅ 파란색 테두리 추가 (요청하신 부분)
        position: 'relative',
        animation: 'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }}>
        
        <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: '900', color: '#333' }}>
          환영합니다! 👋<br/>
          <span style={{ fontSize: '15px', fontWeight: 'normal', color: '#666', display: 'block', marginTop: '8px', lineHeight: '1.4' }}>
            나만의 맛집 지도를 만들어보세요.
          </span>
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px', textAlign: 'left' }}>
          
          {/* 가이드 1 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', background: '#e8f3ff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3182F6', fontSize: '18px', flexShrink: 0 
            }}>
              <FaSearch />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>장소 찾기</div>
              <div style={{ fontSize: '13px', color: '#888' }}>상단 검색창에서 가게를 찾으세요.</div>
            </div>
          </div>

          {/* 가이드 2 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', background: '#fff0f0', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff6b6b', fontSize: '18px', flexShrink: 0 
            }}>
              <FaPen />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>직접 기록하기</div>
              <div style={{ fontSize: '13px', color: '#888' }}>지도 빈 곳을 클릭해 나만의 장소를 남기세요.</div>
            </div>
          </div>

          {/* 가이드 3 */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <div style={{ 
              width: '44px', height: '44px', borderRadius: '50%', background: '#fff9db', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fcc419', fontSize: '22px', flexShrink: 0 
            }}>
              <GiTrophyCup />
            </div>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#333' }}>레벨 업!</div>
              <div style={{ fontSize: '13px', color: '#888' }}>기록을 남기고 경험치를 쌓아 승급하세요.</div>
            </div>
          </div>

        </div>

        <button 
          onClick={onClose}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: '16px',
            border: 'none',
            background: '#3182F6',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(49, 130, 246, 0.3)',
            transition: 'transform 0.1s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          시작하기
        </button>

      </div>

      {/* 팝업 등장 애니메이션 */}
      <style>{`
        @keyframes popIn {
          from { transform: scale(0.8); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default GuideModal;