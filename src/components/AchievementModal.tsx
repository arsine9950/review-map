import { useState } from 'react';
import { FaTimes, FaLock, FaTrophy, FaCheckCircle } from 'react-icons/fa';
import { ACHIEVEMENTS } from '../utils/achievementList';

interface AchievementModalProps {
  onClose: () => void;
  myAchievements: { id: string; date: string }[]; // 내가 깬 업적들
}

const AchievementModal = ({ onClose, myAchievements }: AchievementModalProps) => {
  const [activeTab, setActiveTab] = useState<'일반' | '히든'>('일반');

  // 탭에 맞는 업적만 필터링
  const filteredList = ACHIEVEMENTS.filter(a => a.type === activeTab);
  
  // 달성률 계산
  const achievedCount = filteredList.filter(item => myAchievements.some(m => m.id === item.id)).length;
  const totalCount = filteredList.length;

  return (
    <div className="ui-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ 
        width: '90%', maxWidth: '420px', height: '600px', 
        background: '#f8f9fa', borderRadius: '24px', 
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        
        {/* 헤더 */}
        <div style={{ padding: '20px', background: 'white', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTrophy color="#FFD700" /> 업적 도감
            </h2>
            <span style={{ fontSize: '12px', color: '#888', marginLeft: '2px' }}>
              달성률: {achievedCount} / {totalCount}
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#ccc', cursor: 'pointer' }}>
            <FaTimes />
          </button>
        </div>

        {/* 탭 버튼 */}
        <div style={{ display: 'flex', background: 'white' }}>
          {['일반', '히든'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                flex: 1, padding: '14px', border: 'none', background: 'none',
                fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                borderBottom: activeTab === tab ? '3px solid #3182F6' : '1px solid #eee',
                color: activeTab === tab ? '#3182F6' : '#888'
              }}
            >
              {tab} 업적
            </button>
          ))}
        </div>

        {/* 리스트 영역 */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredList.map((item) => {
            // 달성 여부 확인
            const myRecord = myAchievements.find(m => m.id === item.id);
            const isUnlocked = !!myRecord;
            const isHiddenType = item.type === '히든';

            // 텍스트 색상 결정 (일반 업적: 미달성 시 회색 / 히든: 잠김 처리)
            const titleColor = isUnlocked ? '#333' : (isHiddenType ? '#333' : '#aaa');
            const descColor = isUnlocked ? '#666' : (isHiddenType ? '#888' : '#bbb');
            
            // 아이콘 스타일 (미달성 시 흑백 처리)
            const iconStyle = isUnlocked 
                ? { background: '#f0f4ff', filter: 'none' } 
                : { background: '#eee', filter: isHiddenType ? 'blur(4px)' : 'grayscale(100%) opacity(0.5)' };

            return (
              <div key={item.id} style={{ 
                background: 'white', borderRadius: '16px', padding: '16px',
                border: isUnlocked ? '1px solid #dbe9ff' : '1px solid #eee',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '12px'
              }}>
                
                {/* 좌측: 아이콘 + 텍스트 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                  
                  {/* 아이콘 */}
                  <div style={{ 
                    width: '46px', height: '46px', borderRadius: '50%', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '22px', flexShrink: 0,
                    ...iconStyle
                  }}>
                     {item.icon}
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* 제목 */}
                    <div style={{ fontWeight: 'bold', fontSize: '15px', marginBottom: '4px', color: titleColor }}>
                      {(isHiddenType && !isUnlocked) ? '???' : item.title}
                      {item.rewardTitle && (
                        <span style={{ 
                            fontSize: '10px', color: isUnlocked ? '#3182F6' : '#aaa', 
                            marginLeft: '6px', background: isUnlocked ? '#e8f3ff' : '#f0f0f0', 
                            padding: '2px 6px', borderRadius: '4px' 
                        }}>
                            {isUnlocked ? `보상: ${item.rewardTitle}` : '호칭 보상'}
                        </span>
                      )}
                    </div>

                    {/* 설명 (조건 or 힌트) */}
                    <div style={{ fontSize: '12px', color: descColor, lineHeight: '1.4' }}>
                      {(isHiddenType && !isUnlocked) ? (
                         <span style={{ fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                           <FaLock size={10} /> 힌트: "{item.hint}"
                         </span>
                      ) : (
                         item.condition
                      )}
                    </div>
                    
                    {/* 달성 날짜 */}
                    {isUnlocked && (
                      <div style={{ fontSize: '11px', color: '#3182F6', marginTop: '4px' }}>
                         {new Date(myRecord.date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                {/* 우측: 달성 상태 뱃지 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    {isUnlocked ? (
                        <div style={{ 
                            background: '#E3F2FD', color: '#1E88E5', 
                            padding: '6px 10px', borderRadius: '20px', 
                            fontSize: '11px', fontWeight: 'bold', 
                            display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap'
                        }}>
                            <FaCheckCircle /> 달성 완료
                        </div>
                    ) : (
                        <div style={{ 
                            background: '#f5f5f5', color: '#aaa', 
                            padding: '6px 10px', borderRadius: '20px', 
                            fontSize: '11px', fontWeight: 'bold', 
                            whiteSpace: 'nowrap', border: '1px solid #eee'
                        }}>
                            미달성
                        </div>
                    )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default AchievementModal;