// 레벨 데이터 정의 (레벨, 필요 경험치, 칭호)
export const LEVEL_TABLE = [
  // === 🏠 1단계: 아직은 집이 좋아 (Lv.1 ~ 4) ===
  { level: 1, exp: 0, title: '🍿 방구석 1열' },          // 가입 직후
  { level: 2, exp: 10, title: '🚪 현관문 지킴이' },      // 리뷰 1개
  { level: 3, exp: 30, title: '🏪 편의점 VIP' },         // 리뷰 3개
  { level: 4, exp: 60, title: '🩴 슬리퍼 탐험가' },      // 리뷰 6개
  
  // === 🏃 2단계: 동네 한 바퀴 (Lv.5 ~ 9) ===
  { level: 5, exp: 100, title: '🛵 배달비 킬러' },       // 리뷰 10개 (배달비 아까워서 직접 감)
  { level: 6, exp: 150, title: '👀 옆동네 기웃러' },
  { level: 7, exp: 210, title: '🚌 환승입니다' },
  { level: 8, exp: 280, title: '🚶 뚜벅이 로드' },
  { level: 9, exp: 360, title: '☕ 카공족 대장' },

  // === 🚗 3단계: 핫플 정복자 (Lv.10 ~ 14) ===
  { level: 10, exp: 450, title: '🧭 인간 네비게이션' },  // 리뷰 45개
  { level: 11, exp: 550, title: '🍽️ 맛집 척척박사' },
  { level: 12, exp: 660, title: '🔥 핫플 감별사' },
  { level: 13, exp: 780, title: '⏳ 웨이팅 파괴자' },
  { level: 14, exp: 910, title: '👴 리뷰 깎는 노인' },

  // === 🗺️ 4단계: 대동여지도 (Lv.15 ~ 19) ===
  { level: 15, exp: 1050, title: '📜 김정호의 후예' },   // 리뷰 105개
  { level: 16, exp: 1200, title: '👣 발바닥에 땀나' },
  { level: 17, exp: 1360, title: '📸 로드뷰 인간문화재' },
  { level: 18, exp: 1530, title: '✈️ 역마살 200%' },
  { level: 19, exp: 1710, title: '🌍 지구보다 넓은 발볼' },

  // === 👑 5단계: 만렙 (Lv.20) ===
  { level: 20, exp: 1900, title: '👑 전설의 맵 마스터' } // 리뷰 190개
];

// 현재 경험치(currentExp)를 받아 레벨과 칭호 정보를 반환하는 함수
export const getLevelInfo = (currentExp: number) => {
  // 뒤에서부터 확인해서 내가 도달한 레벨 찾기
  for (let i = LEVEL_TABLE.length - 1; i >= 0; i--) {
    if (currentExp >= LEVEL_TABLE[i].exp) {
      return LEVEL_TABLE[i];
    }
  }
  return LEVEL_TABLE[0]; // 기본 1레벨
};

// 현재 경험치 바 퍼센트(%) 계산 함수 (0~100)
export const getExpProgress = (currentExp: number) => {
  const currentInfo = getLevelInfo(currentExp);
  const currentLevelIndex = LEVEL_TABLE.findIndex(lv => lv.level === currentInfo.level);
  
  // 만렙이면 항상 100%
  if (currentLevelIndex === LEVEL_TABLE.length - 1) {
    return 100;
  }

  const nextLevelInfo = LEVEL_TABLE[currentLevelIndex + 1];

  // (현재EXP - 현재레벨시작EXP) / (다음레벨EXP - 현재레벨시작EXP) * 100
  const expInLevel = currentExp - currentInfo.exp;
  const expRequired = nextLevelInfo.exp - currentInfo.exp;

  const percent = (expInLevel / expRequired) * 100;
  
  // 0보다 작거나 100 넘지 않도록 안전장치
  return Math.min(Math.max(percent, 0), 100);
};