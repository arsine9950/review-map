// src/utils/rankSystem.ts

export const getRankMedal = (rank: number) => {
  if (rank === 1) return '🥇'; // 금메달
  if (rank === 2) return '🥈'; // 은메달
  if (rank >= 3 && rank <= 5) return '🥉'; // 동메달
  if (rank >= 6 && rank <= 10) return '🎖️'; // 6~10위: 훈장 (Military Medal)
  return null; // 11위 밖은 메달 없음
};

// 칭호별 배경색/글자색 지정 (커스텀)
export const getTitleStyle = (titleName: string) => {
  if (titleName.includes('빵지순례자')) {
    return { background: '#FFF8E1', color: '#D35400', border: '1px solid #F5CBA7' }; // 빵 색깔
  }
  if (titleName.includes('대동여지도')) {
    return { background: '#F3E5F5', color: '#8E44AD', border: '1px solid #D2B4DE' }; // 보라색
  }
  // 기본 (초보 모험가 등)
  return { background: '#f0f4ff', color: '#3182F6', border: '1px solid #dae5ff' };
};