import { useState } from 'react';
import { FaSearch, FaCompass, FaScroll, FaEdit, FaMedal, FaPen, FaHeart, FaUserFriends, FaGlobe, FaUser, FaCheck, FaQuestionCircle, FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { GiTrophyCup } from 'react-icons/gi';
import { getExpProgress } from '../utils/levelSystem';
import { getRankMedal, getTitleStyle } from '../utils/rankSystem';
import './MainUI.css';

interface MainUIProps {
  profile: { nickname: string; tag: string; level?: number; title?: string; exp?: number; rank?: number }; 
  stats: { reviewCount: number; likeCount: number; followerCount: number };
  onSearchClick: () => void;
  onMyLocationClick: () => void;
  onHistoryClick: () => void;
  onTitleClick: () => void;
  onQuestClick: () => void;
  onGuideClick: () => void;
}

const MainUI = ({ profile, stats, onSearchClick, onMyLocationClick, onHistoryClick, onTitleClick, onQuestClick, onGuideClick }: MainUIProps) => {
  
  const [filterMode, setFilterMode] = useState<'ALL' | 'FOLLOWER' | 'ME'>('ALL');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // 접기/펼치기 상태 관리
  const [isCollapsed, setIsCollapsed] = useState(false);

  const progressPercent = getExpProgress(profile.exp || 0);
  const medal = getRankMedal(profile.rank || 999);
  const titleStyle = getTitleStyle(profile.title || '');

  const getFilterLabel = () => {
    switch (filterMode) {
        case 'ALL': return { label: '전체', icon: <FaGlobe size={14} color="#3182F6" /> };
        case 'FOLLOWER': return { label: '팔로워', icon: <FaUserFriends size={14} color="#4CAF50" /> };
        case 'ME': return { label: '나만의 지도', icon: <FaUser size={12} color="#FF6B6B" /> };
    }
  };
  const currentFilter = getFilterLabel();

  const getRankText = (rank?: number) => {
    if (!rank) return '상위 99%';
    if (rank <= 100) return `${rank}위`;
    const totalUsers = 30000; 
    const percent = Math.min(Math.ceil((rank / totalUsers) * 100), 99);
    return `상위 ${percent}%`;
  };

  return (
    <div className="ui-overlay">
      
      {/* ================= 상단 영역 ================= */}
      <div className="top-area">
        
        {/* 1. 프로필 카드 */}
        <div className={`profile-card ${isCollapsed ? 'collapsed' : ''}`}>
          
          {/* === [A] 접혔을 때 보여줄 화면 (간략 모드) === */}
          {isCollapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              
              {/* ✅ [수정] 레벨 -> 닉네임 -> 태그 순서 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                 {/* 레벨 */}
                 <span className="level-badge" style={{ padding: '2px 6px', fontSize: '10px' }}>
                   Lv.{profile.level || 1}
                 </span>
                 
                 {/* 닉네임 */}
                 <span style={{ fontWeight: '800', fontSize: '16px', color: '#333' }}>
                   {profile.nickname}
                 </span>
                 
                 {/* 태그 */}
                 <span style={{ fontSize: '13px', color: '#aaa' }}>
                   #{profile.tag}
                 </span>
              </div>

              {/* 우측 버튼 그룹 */}
              <div className="header-btn-group">
                <button className="icon-btn" onClick={() => setIsCollapsed(false)} title="펼치기">
                  <FaChevronDown />
                </button>
                <button className="icon-btn" onClick={onGuideClick} title="가이드">
                  <FaQuestionCircle />
                </button>
              </div>

            </div>
          ) : (
            /* === [B] 펼쳐졌을 때 보여줄 화면 (전체 모드) === */
            <>
              {/* 상단: 칭호 + 레벨 + 버튼들 */}
              <div className="profile-header-row">
                <div className="badges-group">
                   <div className="title-badge" onClick={onTitleClick} style={{ ...titleStyle, cursor: 'pointer' }}>
                     {profile.title || '초보 모험가'}
                     <FaEdit size={10} style={{ opacity: 0.5 }} />
                   </div>
                   <span className="level-badge">Lv.{profile.level || 1}</span>
                </div>

                {/* 버튼 그룹 (접기 + 가이드) */}
                <div className="header-btn-group">
                  <button className="icon-btn" onClick={() => setIsCollapsed(true)} title="접기">
                    <FaChevronUp />
                  </button>
                  <button className="icon-btn" onClick={onGuideClick} title="가이드">
                    <FaQuestionCircle />
                  </button>
                </div>
              </div>

              {/* 중단: 닉네임 + 태그 */}
              <div className="nickname-row">
                 <div style={{ width: '24px', display: 'flex', justifyContent: 'center' }}>
                    {medal || <FaMedal size={18} color="#e0e0e0" />}
                 </div>
                 <span className="nickname-text">{profile.nickname}</span>
                 <span className="tag-text">#{profile.tag}</span>
              </div>

              {/* 경험치 바 */}
              <div className="exp-bar-bg">
                <div className="exp-bar-fill" style={{ width: `${progressPercent}%` }}></div>
              </div>

              {/* 하단: 통계 + 랭킹 */}
              <div className="stats-row">
                 <div className="stats-group">
                    <div className="stat-item"><FaPen size={11} color="#3182F6" /> {stats.reviewCount}</div>
                    <div className="stat-item"><FaHeart size={11} color="#FF6B6B" /> {stats.likeCount}</div>
                    <div className="stat-item"><FaUserFriends size={12} color="#4CAF50" /> {stats.followerCount}</div>
                 </div>
                 <div className="rank-group">
                    <GiTrophyCup color="#FFD700" size={14} />
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#3182F6' }}>
                       {getRankText(profile.rank)}
                    </span>
                 </div>
              </div>
            </>
          )}

        </div>

        {/* 2. 검색 버튼 */}
        <div className="search-trigger" onClick={onSearchClick}>
          <FaSearch color="#3182F6" /> 검색 공간 추가 (가게, 지역 찾기)
        </div>

      </div>


      {/* ================= 하단 버튼들 (필터 & 기능) ================= */}
      
      {/* 왼쪽: 필터 */}
      <div style={{ position: 'absolute', bottom: '20px', left: '16px', zIndex: 100, pointerEvents: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          {isFilterOpen && (
              <div style={{ marginBottom: '10px', background: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px', animation: 'fadeIn 0.2s ease-out' }}>
                  <button onClick={() => { setFilterMode('ALL'); setIsFilterOpen(false); }} style={{ padding: '10px', borderRadius: '8px', border: 'none', background: filterMode === 'ALL' ? '#f0f7ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333', textAlign: 'left' }}>
                      <FaGlobe color="#3182F6" /> 전체 {filterMode === 'ALL' && <FaCheck size={10} color="#3182F6" style={{ marginLeft: 'auto' }} />}
                  </button>
                  <button onClick={() => { setFilterMode('FOLLOWER'); setIsFilterOpen(false); }} style={{ padding: '10px', borderRadius: '8px', border: 'none', background: filterMode === 'FOLLOWER' ? '#f0f7ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333', textAlign: 'left' }}>
                      <FaUserFriends color="#4CAF50" /> 팔로워 {filterMode === 'FOLLOWER' && <FaCheck size={10} color="#3182F6" style={{ marginLeft: 'auto' }} />}
                  </button>
                  <button onClick={() => { setFilterMode('ME'); setIsFilterOpen(false); }} style={{ padding: '10px', borderRadius: '8px', border: 'none', background: filterMode === 'ME' ? '#f0f7ff' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 'bold', color: '#333', textAlign: 'left' }}>
                      <FaUser color="#FF6B6B" /> 나만의 지도 {filterMode === 'ME' && <FaCheck size={10} color="#3182F6" style={{ marginLeft: 'auto' }} />}
                  </button>
              </div>
          )}
          <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="bottom-btn">
            {currentFilter.icon} <span className="mobile-hidden-text">{currentFilter.label}</span>
          </button>
      </div>

      {/* 우측: 도감, 리뷰, 위치 */}
      <div style={{ position: 'absolute', bottom: '20px', right: '16px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px', zIndex: 100, pointerEvents: 'auto' }}>
        <button onClick={onQuestClick} className="bottom-btn"><GiTrophyCup size={16} color="#b39906ff" /><span className="mobile-hidden-text">내 도감</span></button>
        <button onClick={onHistoryClick} className="bottom-btn"><FaScroll size={14} color="#666" /><span className="mobile-hidden-text">내 리뷰</span></button>
        <button onClick={onMyLocationClick} className="bottom-btn" style={{ background: '#3182F6', color: 'white' }}><FaCompass size={16} /><span className="mobile-hidden-text">내 위치</span></button>
      </div>

    </div>
  );
};

export default MainUI;