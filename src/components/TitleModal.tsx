import { FaTimes, FaCheck } from 'react-icons/fa';
import { getTitleStyle } from '../utils/rankSystem';

interface TitleModalProps {
  onClose: () => void;
  myTitles: string[]; // 내가 보유한 칭호 목록
  currentTitle: string; // 현재 장착 중인 칭호
  onSelectTitle: (title: string) => void;
}

const TitleModal = ({ onClose, myTitles, currentTitle, onSelectTitle }: TitleModalProps) => {
  return (
    <div className="ui-overlay" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 500, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '320px', background: 'white', borderRadius: '20px', padding: '24px', position: 'relative' }}>
        
        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '18px', cursor: 'pointer', color: '#999' }}>
            <FaTimes />
        </button>

        <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>칭호 변경</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {myTitles.map((title) => {
            const isSelected = currentTitle === title;
            const style = getTitleStyle(title);

            return (
              <div 
                key={title} 
                onClick={() => {
                    onSelectTitle(title);
                    onClose();
                }}
                style={{ 
                  padding: '12px', borderRadius: '12px', cursor: 'pointer',
                  border: isSelected ? '2px solid #3182F6' : '1px solid #eee',
                  background: isSelected ? '#f9fcff' : 'white',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}
              >
                <span style={{ 
                    fontSize: '13px', fontWeight: 'bold', 
                    padding: '4px 8px', borderRadius: '4px',
                    ...style 
                }}>
                  {title}
                </span>
                {isSelected && <FaCheck color="#3182F6" />}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default TitleModal;