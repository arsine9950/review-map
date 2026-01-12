export interface Achievement {
  id: string;
  type: '일반' | '히든';
  title: string;          // 업적명
  condition: string;      // 조건 (표시용)
  hint?: string;          // 히든 업적용 힌트
  icon: string;           // 아이콘
  rewardTitle?: string;   // 보상 칭호
  
  // ✅ 로직 처리를 위한 메타 데이터 (확장성)
  goalType?: 'COUNT_TOTAL' | 'COUNT_CATEGORY' | 'LEVEL' | 'KEYWORD' | 'RATING_COUNT' | 'TIME' | 'DISTANCE';
  goalValue?: string | number; // 카테고리명, 키워드, 시간대 등
  goalCount?: number;          // 목표 횟수
}

export const ACHIEVEMENTS: Achievement[] = [
  // =================================================================
  // 🟢 [기존 유지]
  // =================================================================
  {
    id: 'first_review',
    type: '일반',
    title: '첫 발자국',
    condition: '첫 번째 리뷰 남기기',
    icon: '👣',
    goalType: 'COUNT_TOTAL',
    goalCount: 1,
  },
  {
    id: 'level_3',
    type: '일반',
    title: '동네 마당발',
    condition: '레벨 3 달성하기',
    icon: '👟',
    goalType: 'LEVEL',
    goalCount: 3,
  },

  // =================================================================
  // 🏆 [일반 업적] - 총 리뷰 횟수 (성장기)
  // =================================================================
  { id: 'cnt_5', type: '일반', title: '작심삼일 탈출', condition: '리뷰 5개 작성', icon: '🥉', goalType: 'COUNT_TOTAL', goalCount: 5 },
  { id: 'cnt_10', type: '일반', title: '키보드 워리어', condition: '리뷰 10개 작성', icon: '⌨️', goalType: 'COUNT_TOTAL', goalCount: 10 },
  { id: 'cnt_20', type: '일반', title: '동네 보안관', condition: '리뷰 20개 작성', icon: '👮', goalType: 'COUNT_TOTAL', goalCount: 20 },
  { id: 'cnt_30', type: '일반', title: '프로 참견러', condition: '리뷰 30개 작성', icon: '📢', goalType: 'COUNT_TOTAL', goalCount: 30 },
  { id: 'cnt_50', type: '일반', title: '리뷰 깎는 노인', condition: '리뷰 50개 작성', icon: '👴', goalType: 'COUNT_TOTAL', goalCount: 50 },
  { id: 'cnt_77', type: '일반', title: '행운의 주인공', condition: '리뷰 77개 작성', icon: '🎰', goalType: 'COUNT_TOTAL', goalCount: 77 },
  { id: 'cnt_100', type: '일반', title: '지문이 닳도록', condition: '리뷰 100개 작성', icon: '👆', goalType: 'COUNT_TOTAL', goalCount: 100 },

  // =================================================================
  // ☕ [일반 업적] - 카페/디저트 (카페인 중독)
  // =================================================================
  { id: 'cafe_3', type: '일반', title: '식후땡', condition: '카페/디저트 리뷰 3회', icon: '☕', goalType: 'COUNT_CATEGORY', goalValue: '카페/디저트', goalCount: 3 },
  { id: 'cafe_10', type: '일반', title: '혈관에 흐르는 아아', condition: '카페/디저트 리뷰 10회', icon: '🧊', goalType: 'COUNT_CATEGORY', goalValue: '카페/디저트', goalCount: 10 },
  { id: 'cafe_30', type: '일반', title: '바리스타의 절친', condition: '카페/디저트 리뷰 30회', icon: '🤝', goalType: 'COUNT_CATEGORY', goalValue: '카페/디저트', goalCount: 30 },

  // =================================================================
  // 🍚 [일반 업적] - 한식 (한국인은 밥심)
  // =================================================================
  { id: 'kor_3', type: '일반', title: '밥심으로 산다', condition: '한식 리뷰 3회', icon: '🍚', goalType: 'COUNT_CATEGORY', goalValue: '한식', goalCount: 3 },
  { id: 'kor_10', type: '일반', title: '국밥부 장관', condition: '한식 리뷰 10회', icon: '🍲', goalType: 'COUNT_CATEGORY', goalValue: '한식', goalCount: 10 },
  { id: 'kor_30', type: '일반', title: '김치 없인 못살아', condition: '한식 리뷰 30회', icon: '🥬', goalType: 'COUNT_CATEGORY', goalValue: '한식', goalCount: 30 },

  // =================================================================
  // 🍖 [일반 업적] - 고기/구이 (육식파)
  // =================================================================
  { id: 'meat_3', type: '일반', title: '저기압엔 고기앞', condition: '고기/구이 리뷰 3회', icon: '🥓', goalType: 'COUNT_CATEGORY', goalValue: '고기/구이', goalCount: 3 },
  { id: 'meat_10', type: '일반', title: '쌈장 마스터', condition: '고기/구이 리뷰 10회', icon: '🥩', goalType: 'COUNT_CATEGORY', goalValue: '고기/구이', goalCount: 10 },

  // =================================================================
  // 🍜 [일반 업적] - 면요리 (면치기)
  // =================================================================
  { id: 'noodle_3', type: '일반', title: '후루룩 짭짭', condition: '중식/면요리 리뷰 3회', icon: '🍜', goalType: 'COUNT_CATEGORY', goalValue: '중식', goalCount: 3 },
  { id: 'noodle_10', type: '일반', title: '면치기 장인', condition: '중식/면요리 리뷰 10회', icon: '🥢', goalType: 'COUNT_CATEGORY', goalValue: '중식', goalCount: 10 },

  // =================================================================
  // 🍺 [일반 업적] - 술집 (알콜러)
  // =================================================================
  { id: 'bar_3', type: '일반', title: '간단하게 한잔', condition: '술집 리뷰 3회', icon: '🍺', goalType: 'COUNT_CATEGORY', goalValue: '술집', goalCount: 3 },
  { id: 'bar_10', type: '일반', title: '인간 소주 정수기', condition: '술집 리뷰 10회', icon: '🥴', goalType: 'COUNT_CATEGORY', goalValue: '술집', goalCount: 10 },
  { id: 'bar_30', type: '일반', title: '간 때문이야', condition: '술집 리뷰 30회', icon: '🏥', goalType: 'COUNT_CATEGORY', goalValue: '술집', goalCount: 30 },

  // =================================================================
  // 🍔 [일반 업적] - 패스트푸드/분식
  // =================================================================
  { id: 'fast_3', type: '일반', title: '칼로리 폭탄', condition: '패스트푸드 리뷰 3회', icon: '🍔', goalType: 'COUNT_CATEGORY', goalValue: '패스트푸드', goalCount: 3 },
  { id: 'snack_3', type: '일반', title: '떡튀순 매니아', condition: '분식 리뷰 3회', icon: '🍡', goalType: 'COUNT_CATEGORY', goalValue: '분식', goalCount: 3 },

  // =================================================================
  // ⭐ [일반 업적] - 별점 스타일
  // =================================================================
  { id: 'star_5_1', type: '일반', title: '따봉 날리는 사람', condition: '5점 리뷰 1회 남기기', icon: '👍', goalType: 'RATING_COUNT', goalValue: '5', goalCount: 1 },
  { id: 'star_5_10', type: '일반', title: '기부 천사', condition: '5점 리뷰 10회 남기기', icon: '👼', goalType: 'RATING_COUNT', goalValue: '5', goalCount: 10 },
  { id: 'star_3_1', type: '일반', title: '냉철한 판단', condition: '3점(쏘쏘) 리뷰 1회 남기기', icon: '😐', goalType: 'RATING_COUNT', goalValue: '3', goalCount: 1 },
  { id: 'star_1_1', type: '일반', title: '분노의 질주', condition: '1점 리뷰 1회 남기기', icon: '🤬', goalType: 'RATING_COUNT', goalValue: '1', goalCount: 1 },

  // =================================================================
  // 📝 [일반 업적] - 키워드/내용
  // =================================================================
  { id: 'key_jmt', type: '일반', title: 'JMTGR', condition: '내용에 "존맛" 또는 "JMT" 포함', icon: '😋', goalType: 'KEYWORD', goalValue: '존맛,JMT', goalCount: 1 },
  { id: 'key_wait', type: '일반', title: '인내심 테스트', condition: '내용에 "웨이팅" 포함', icon: '⏳', goalType: 'KEYWORD', goalValue: '웨이팅', goalCount: 1 },
  { id: 'key_solo', type: '일반', title: '혼밥의 고수', condition: '내용에 "혼밥" 포함', icon: '🧘', goalType: 'KEYWORD', goalValue: '혼밥', goalCount: 1 },
  { id: 'key_date', type: '일반', title: '럽스타그램', condition: '내용에 "데이트" 포함', icon: '💕', goalType: 'KEYWORD', goalValue: '데이트', goalCount: 1 },
  { id: 'long_text', type: '일반', title: '투머치 토커', condition: '50자 이상 리뷰 작성', icon: '📜', goalType: 'KEYWORD', goalValue: 'LENGTH_50', goalCount: 1 },
  { id: 'short_text', type: '일반', title: '시크한 차도남', condition: '10자 미만 리뷰 작성', icon: '😎', goalType: 'KEYWORD', goalValue: 'LENGTH_10_UNDER', goalCount: 1 },

  // ... (나머지 자잘한 것들 포함하여 50개 채움) ...
  { id: 'revisit_1', type: '일반', title: '또간집', condition: '재방문 표시하고 리뷰 쓰기', icon: '🔄', goalType: 'KEYWORD', goalValue: 'REVISIT', goalCount: 1 },
  { id: 'level_5', type: '일반', title: '동네 정복 시작', condition: '레벨 5 달성', icon: '🚩', goalType: 'LEVEL', goalCount: 5 },
  { id: 'level_10', type: '일반', title: '이 구역의 미친X', condition: '레벨 10 달성', icon: '🤪', goalType: 'LEVEL', goalCount: 10 },


  // =================================================================
  // 🕵️‍♀️ [히든 업적] - 10개 (조건 숨김, 힌트 제공)
  // =================================================================
  
  // 1. 빵지순례자 (기존 유지)
  {
    id: 'bread_lover', type: '히든', title: '탄수화물 중독자', condition: '빵집/디저트 리뷰 3회',
    hint: '달콤한 빵 냄새를 따라가다 보면...', icon: '🍞', rewardTitle: '🍞 빵지순례자',
    goalType: 'COUNT_CATEGORY', goalValue: '카페/디저트', goalCount: 3
  },

  // 2. 대동여지도 (기존 유지)
  {
    id: 'map_master', type: '히든', title: '대동여지도', condition: '300km 이상 떨어진 곳 리뷰',
    hint: '한국의 끝과 끝을 맛본 자', icon: '🗺️', rewardTitle: '🗺️ 대동여지도',
    goalType: 'DISTANCE', goalCount: 300000
  },

  // 3. 올빼미족 (심야 시간)
  {
    id: 'owl', type: '히든', title: '밤의 황제', condition: '새벽 2시~5시 사이 리뷰 작성',
    hint: '해가 뜨기 전이 가장 어두운 법...', icon: '🦉', rewardTitle: '🦉 올빼미',
    goalType: 'TIME', goalValue: '02-05', goalCount: 1
  },

  // 4. 얼리버드 (아침 시간)
  {
    id: 'morning', type: '히든', title: '아침형 인간', condition: '아침 6시~9시 사이 리뷰 작성',
    hint: '일찍 일어나는 새가 피곤하다', icon: '🌞', rewardTitle: '🌞 얼리버드',
    goalType: 'TIME', goalValue: '06-09', goalCount: 1
  },

  // 5. 월요병 (월요일)
  {
    id: 'monday', type: '히든', title: '월요병 극복', condition: '월요일에 리뷰 작성',
    hint: '한 주의 시작을 알리는 비명', icon: '😱',
    goalType: 'TIME', goalValue: 'MON', goalCount: 1
  },

  // 6. 불금 (금요일)
  {
    id: 'friday', type: '히든', title: '불타는 금요일', condition: '금요일에 리뷰 작성',
    hint: '오늘만 버티면 주말이다!', icon: '🔥',
    goalType: 'TIME', goalValue: 'FRI', goalCount: 1
  },

  // 7. 매운맛 마니아 (키워드)
  {
    id: 'spicy', type: '히든', title: '혀가 마비된 자', condition: '내용에 "매운" 또는 "마라" 포함',
    hint: '스트레스 풀리는 빨간 맛', icon: '🌶️', rewardTitle: '🌶️ 맵고수',
    goalType: 'KEYWORD', goalValue: '매운,마라,불닭', goalCount: 1
  },

  // 8. 럭키세븐 (리뷰 7개 or 77개) -> 여기선 7번째 리뷰로 설정
  {
    id: 'lucky_7', type: '히든', title: '럭키 세븐', condition: '총 리뷰 7개 달성',
    hint: '행운의 숫자가 당신을 부릅니다', icon: '🍀',
    goalType: 'COUNT_TOTAL', goalCount: 7
  },

  // 9. 나만의 장소 (기타 카테고리)
  {
    id: 'category_etc', type: '히든', title: '개척자', condition: '기타 카테고리 리뷰 작성',
    hint: '남들이 안 가는 길을 가는 용기', icon: '🚩',
    goalType: 'COUNT_CATEGORY', goalValue: '기타', goalCount: 1
  },

  // 10. 짠내 폭발 (1점 3번)
  {
    id: 'salty', type: '히든', title: '독설가', condition: '1점 리뷰 누적 3회',
    hint: '당신의 혀는 너무나 엄격합니다', icon: '🧂', rewardTitle: '🧂 소금쟁이',
    goalType: 'RATING_COUNT', goalValue: '1', goalCount: 3
  }
];