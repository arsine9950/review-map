import { useEffect, useState } from 'react';
import './CelebrationModal.css';

interface CelebrationModalProps {
  newAchievements: { id: string; title: string; type: string }[];
  onClose: () => void;
}

const CelebrationModal = ({ newAchievements, onClose }: CelebrationModalProps) => {
  // 히든 미션이 포함되어 있는지 확인 (type이 'HIDDEN'이거나 특정 ID일 때)
  // 예시: type이 'HIDDEN'인 경우 상자 애니메이션 트리거
  const hasHidden = newAchievements.some(a => a.type === 'HIDDEN');
  
  const [step, setStep] = useState(hasHidden ? 'BOX' : 'REVEAL'); // BOX: 상자흔들림, REVEAL: 결과공개

  useEffect(() => {
    if (hasHidden) {
      // 히든 미션이면 2초 뒤에 상자가 열리게 연출
      const timer = setTimeout(() => {
        setStep('REVEAL');
      }, 2500); 
      return () => clearTimeout(timer);
    }
  }, [hasHidden]);

  return (
    <div className="celebration-overlay" onClick={onClose}>
      <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
        
        {/* === CASE 1: 히든 미션 (상자 연출) === */}
        {hasHidden && step === 'BOX' && (
          <div style={{ textAlign: 'center' }}>
            <div className="celebration-title" style={{ color: '#FFD700' }}>히든 미션 발견?!</div>
            <div className="celebration-desc">무언가 특별한 업적이 달성되었습니다...</div>
            
            {/* 흔들리는 상자 */}
            <div className="treasure-box box-shake">
              🎁
            </div>
            <p style={{ fontSize: '12px', color: '#999' }}>두근두근...</p>
          </div>
        )}

        {/* === CASE 2: 결과 공개 (폭죽 + 리스트) === */}
        {step === 'REVEAL' && (
          <>
            {/* 배경 폭죽 효과 */}
            <div className="firework" style={{ top: '20%', left: '20%', animationDelay: '0s' }}></div>
            <div className="firework" style={{ top: '30%', left: '80%', animationDelay: '0.2s' }}></div>
            <div className="firework" style={{ top: '70%', left: '50%', animationDelay: '0.4s' }}></div>

            <div style={{ fontSize: '60px', marginBottom: '10px' }}>
              {hasHidden ? '🎊' : '🎉'}
            </div>

            <h2 className="celebration-title">축하합니다!</h2>
            <p className="celebration-desc">새로운 업적을 달성했어요!</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {newAchievements.map((ach, idx) => (
                <div 
                  key={ach.id} 
                  className="achievement-item" 
                  style={{ animationDelay: `${idx * 0.2}s` }} // 순차적으로 등장
                >
                  <span style={{ marginRight: '6px' }}>
                    {ach.type === 'HIDDEN' ? '👑' : '🏆'}
                  </span>
                  [{ach.type === 'HIDDEN' ? '히든' : '일반'}] {ach.title}
                </div>
              ))}
            </div>

            <button className="confirm-btn" onClick={onClose}>
              멋져요!
            </button>
          </>
        )}

      </div>
    </div>
  );
};

export default CelebrationModal;