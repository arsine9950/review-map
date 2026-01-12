// Achievement 단어를 지우고, ACHIEVEMENTS만 남기세요!
import { ACHIEVEMENTS } from './achievementList';

interface AchievementRecord {
  id: string;
  date: string;
}

/**
 * 범용 업적 체크 함수
 * @param reviewCount 총 리뷰 수
 * @param reviews 전체 리뷰 데이터 (카테고리, 시간, 내용 분석용)
 * @param currentTitles 보유 칭호
 * @param currentAchievements 달성 업적 목록
 * @param newReview 방금 작성한 따끈따끈한 리뷰 데이터
 * @param myLevel 현재 레벨
 */
export const checkAchievements = (
  reviewCount: number,
  reviews: any[],
  currentTitles: string[],
  currentAchievements: AchievementRecord[],
  newReview: any,
  myLevel: number
) => {
  let updatedTitles = [...currentTitles];
  let updatedAchievements = [...currentAchievements];
  let isChanged = false;
  let newUnlockMsg = "";

  // 현재 시간, 요일 구하기
  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay(); // 0:일, 1:월 ... 5:금

  // ✅ 모든 업적 리스트를 순회하며 체크
  ACHIEVEMENTS.forEach((ach) => {
    // 이미 달성한건 패스
    if (updatedAchievements.find(a => a.id === ach.id)) return;

    let isUnlocked = false;

    // --- 조건별 로직 ---
    switch (ach.goalType) {
      
      // 1. 총 리뷰 개수 (예: 50개 작성)
      case 'COUNT_TOTAL':
        if (reviewCount >= (ach.goalCount || 0)) isUnlocked = true;
        break;

      // 2. 카테고리별 개수 (예: 카페 10개)
      case 'COUNT_CATEGORY':
        const catCount = reviews.filter(r => r.category && r.category.includes(ach.goalValue as string)).length;
        if (catCount >= (ach.goalCount || 0)) isUnlocked = true;
        break;

      // 3. 레벨 달성
      case 'LEVEL':
        if (myLevel >= (ach.goalCount || 0)) isUnlocked = true;
        break;

      // 4. 별점 횟수 (예: 1점 3번)
      case 'RATING_COUNT':
        const rateCount = reviews.filter(r => r.rating === Number(ach.goalValue)).length;
        if (rateCount >= (ach.goalCount || 0)) isUnlocked = true;
        break;

      // 5. 키워드 포함 (예: "존맛") - 방금 쓴 리뷰 기준
      case 'KEYWORD':
        if (ach.goalValue === 'LENGTH_50') {
           if (newReview.content.length >= 50) isUnlocked = true;
        } else if (ach.goalValue === 'LENGTH_10_UNDER') {
           if (newReview.content.length > 0 && newReview.content.length < 10) isUnlocked = true;
        } else if (ach.goalValue === 'REVISIT') {
           if (newReview.revisit) isUnlocked = true;
        } else {
           // 쉼표로 구분된 키워드 중 하나라도 포함되면 OK
           const keywords = (ach.goalValue as string).split(',');
           if (keywords.some(k => newReview.content.includes(k))) isUnlocked = true;
        }
        break;

      // 6. 시간/요일 (예: 새벽, 월요일) - 방금 쓴 리뷰 기준
      case 'TIME':
        if (ach.goalValue === 'MON' && currentDay === 1) isUnlocked = true;
        else if (ach.goalValue === 'FRI' && currentDay === 5) isUnlocked = true;
        else if (typeof ach.goalValue === 'string' && ach.goalValue.includes('-')) {
            const [start, end] = ach.goalValue.split('-').map(Number);
            if (currentHour >= start && currentHour < end) isUnlocked = true;
        }
        break;
      
      // 7. 거리 (필요시 추가)
      case 'DISTANCE':
        break;
    }

    // --- 달성 처리 ---
    if (isUnlocked) {
      updatedAchievements.push({ id: ach.id, date: new Date().toISOString() });
      isChanged = true;
      newUnlockMsg += `\n🎉 [${ach.type}] ${ach.title} 달성!`;

      // 보상 칭호가 있다면 지급
      if (ach.rewardTitle && !updatedTitles.includes(ach.rewardTitle)) {
        updatedTitles.push(ach.rewardTitle);
        newUnlockMsg += `\n🎁 보상: ${ach.rewardTitle}`;
      }
    }
  });

  return { isChanged, updatedTitles, updatedAchievements, newUnlockMsg };
};