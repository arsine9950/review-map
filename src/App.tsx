import { useState, useEffect } from 'react';
import MapContainer from './components/MapContainer';
import MainUI from './components/MainUI';
import NicknameModal from './components/NicknameModal';
import SearchModal from './components/SearchModal';
import ReviewModal from './components/ReviewModal';
import ReviewDetailModal from './components/ReviewDetailModal'; 
import MyHistoryModal from './components/MyHistoryModal'; 
import GuideModal from './components/GuideModal'; 
import TitleModal from './components/TitleModal'; 
import AchievementModal from './components/AchievementModal'; 
import CelebrationModal from './components/CelebrationModal'; 
import NameInputModal from './components/NameInputModal';

import { getLevelInfo } from './utils/levelSystem';
import { ACHIEVEMENTS } from './utils/achievementList'; 
import { checkAchievements } from './utils/achievementCheck'; 

import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, addDoc, query, onSnapshot, orderBy, deleteDoc, setDoc, updateDoc } from 'firebase/firestore';
import './App.css';

// 거리 계산 함수 (미터 단위)
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; 
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  const [myProfile, setMyProfile] = useState<{ 
    nickname: string; 
    tag: string; 
    uid: string; 
    level?: number; 
    title?: string;
    exp?: number;
    availableTitles?: string[]; 
    achievements?: { id: string; date: string }[]; 
    rank?: number;
  } | null>(null);

  const [initChecking, setInitChecking] = useState(true);

  // UI 상태 관리
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any | null>(null); 
  const [isReviewOpen, setIsReviewOpen] = useState(false); 
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [isAchievementOpen, setIsAchievementOpen] = useState(false); 
  const [isNameInputOpen, setIsNameInputOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false); // 상세창 열림 상태

  // 데이터 상태 관리
  const [celebrationData, setCelebrationData] = useState<{ id: string; title: string; type: string }[] | null>(null);
  const [pendingLocation, setPendingLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [selectedPlaceReviews, setSelectedPlaceReviews] = useState<any[]>([]); // 선택된 장소의 리뷰 목록
  const [targetLocation, setTargetLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [currentGPS, setCurrentGPS] = useState<{ lat: number; lng: number } | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  // 1. 초기 로그인 및 사용자 정보 로드
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
            const data = userDoc.data();
            const currentExp = data.exp || 0;
            const levelInfo = getLevelInfo(currentExp);
            
            const myTitles = data.availableTitles || ['초보 모험가'];
            const myAchievements = data.achievements || []; 
            const currentTitle = data.title || levelInfo.title;
            const mockRank = Math.floor(Math.random() * 20) + 1; 

            setMyProfile({ 
              nickname: data.nickname, 
              tag: data.tag, 
              uid: user.uid,
              exp: currentExp,
              level: levelInfo.level, 
              title: currentTitle,
              availableTitles: myTitles,
              achievements: myAchievements, 
              rank: mockRank
            });
            setIsLoggedIn(true);
        }
      } else {
        setIsLoggedIn(false);
      }
      setInitChecking(false);
    });

    // 실시간 GPS 추적
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCurrentGPS({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => console.error("GPS Error:", err),
      { enableHighAccuracy: true }
    );

    return () => {
      unsubscribeAuth();
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  // 1-2. 로그인 후 가이드 노출 여부 확인
  useEffect(() => {
    if (isLoggedIn && !isGuideOpen) {
      const hasSeen = localStorage.getItem('hasSeenGuide');
      if (!hasSeen) {
        setIsGuideOpen(true);
      }
    }
  }, [isLoggedIn]);

  // 2. 전체 리뷰 데이터 실시간 구독
  useEffect(() => {
    const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedReviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReviews(loadedReviews);
    });
    return () => unsubscribe();
  }, []);

  // 칭호 변경
  const handleChangeTitle = async (newTitle: string) => {
      if (!myProfile) return;
      try {
        await updateDoc(doc(db, "users", myProfile.uid), { title: newTitle });
        setMyProfile(prev => prev ? ({ ...prev, title: newTitle }) : null);
      } catch (e) { console.error(e); }
  };

  // 가이드 다시보기
  const handleOpenGuide = () => {
    localStorage.removeItem('hasSeenGuide'); 
    setIsGuideOpen(true); 
  };

  // 지도 빈 곳 클릭 (새 리뷰 작성 시도)
  const handleMapClick = (location: { lat: number; lng: number; address: string }) => {
    setTargetLocation({ lat: location.lat, lng: location.lng });
    
    // 클릭 실수 방지를 위한 짧은 지연 시간 및 확인
    setTimeout(() => {
        if (!window.confirm(`"${location.address}"\n이 위치에 리뷰를 남기시겠습니까?`)) return;
        setPendingLocation(location);
        setIsNameInputOpen(true); 
    }, 100);
  };

  // 장소 이름 입력 후 리뷰 작성창 열기
  const handleNameSubmit = (enteredName: string) => {
    if (!pendingLocation) return;
    
    const finalName = enteredName.trim() || pendingLocation.address; 

    setSelectedPlace({
        name: finalName, 
        address: pendingLocation.address,
        lat: pendingLocation.lat, lng: pendingLocation.lng, category: '기타' 
    });
    
    setIsNameInputOpen(false); 
    setIsReviewOpen(true);     
  };

  // 리뷰 저장 로직 (경험치, 업적 체크 포함)
  const handleSaveReview = async (reviewData: any) => {
    if (!selectedPlace || !myProfile) return;
    if (!currentGPS) { alert("GPS를 켜주세요."); return; }

    const finalPlaceName = reviewData.placeName || selectedPlace.name;

    const distance = getDistance(currentGPS.lat, currentGPS.lng, selectedPlace.lat, selectedPlace.lng);
    // 거리 제한 (50km)
    if (distance > 50000) { alert(`너무 멉니다 (약 ${Math.round(distance)}m).`); return; }

    // 중복 및 쿨타임 체크
    const existingReview = reviews.find(r => r.userId === myProfile.uid && r.placeName === finalPlaceName);
    if (!existingReview) {
      const myLastReview = reviews.filter(r => r.userId === myProfile.uid)[0];
      if (myLastReview) {
        const diffMinutes = (Date.now() - new Date(myLastReview.createdAt).getTime()) / (1000 * 60);
        if (diffMinutes < 1) {
          alert(`쿨타임 중입니다. ${Math.round(30 - diffMinutes)}분 후 다시 시도해주세요.`);
          return;
        }
      }
    }

    // 경험치 및 레벨 계산
    let newExp = myProfile.exp || 0;
    if (!existingReview) newExp += 10;
    const newLevelInfo = getLevelInfo(newExp);
    const isLevelUp = newLevelInfo.level > (myProfile.level || 1);

    const newReviewData = {
      userId: myProfile.uid,
      nickname: `${myProfile.nickname} ${myProfile.tag}`,
      userTitle: myProfile.title, 
      userLevel: newLevelInfo.level, 
      userRank: myProfile.rank,   
      placeName: finalPlaceName,
      address: selectedPlace.address,
      category: reviewData.selectedCat,
      content: reviewData.text,
      rating: reviewData.rating,
      subRatings: reviewData.subRatings,
      revisit: reviewData.revisit,
      lat: selectedPlace.lat,
      lng: selectedPlace.lng,
      createdAt: new Date().toISOString()
    };

    try {
      if (existingReview) {
        await setDoc(doc(db, "reviews", existingReview.id), newReviewData);
      } else {
        await addDoc(collection(db, "reviews"), newReviewData);
      }

      const myReviews = reviews.filter(r => r.userId === myProfile.uid);
      if (!existingReview) myReviews.push(newReviewData); 

      // 업적 체크
      const currentTitles = myProfile.availableTitles || ['초보 모험가'];
      const currentAchievements = myProfile.achievements || [];

      const { isChanged, updatedTitles, updatedAchievements } = checkAchievements(
          myReviews.length,     
          myReviews,            
          currentTitles,        
          currentAchievements,  
          newReviewData,        
          newLevelInfo.level    
      );

      // 사용자 정보 업데이트
      if (!existingReview || isChanged) {
         const updates: any = { exp: newExp, level: newLevelInfo.level };
         if (isChanged) {
            updates.availableTitles = updatedTitles;
            updates.achievements = updatedAchievements;
         }

         await updateDoc(doc(db, "users", myProfile.uid), updates);

         setMyProfile(prev => prev ? ({ 
             ...prev, 
             exp: newExp, 
             level: newLevelInfo.level, 
             availableTitles: isChanged ? updatedTitles : prev.availableTitles,
             achievements: isChanged ? updatedAchievements : prev.achievements
         }) : null);
      }

      let msg = existingReview ? "수정 완료! 📝" : "기록 저장 완료! (EXP +10) 🚩";
      if (isLevelUp) msg += `\n🎉 Level ${newLevelInfo.level} 승급!`;
      alert(msg);

      // 새 업적 달성 시 모달 데이터 세팅
      if (isChanged) {
        const oldIds = currentAchievements.map(a => a.id);
        const newItems = updatedAchievements
            .filter(a => !oldIds.includes(a.id))
            .map(newAch => {
                const info = ACHIEVEMENTS.find(item => item.id === newAch.id);
                return {
                    id: newAch.id,
                    title: info ? info.title : '알 수 없는 업적',
                    type: info ? (info.type || 'NORMAL') : 'NORMAL'
                };
            });
        
        if (newItems.length > 0) {
            setCelebrationData(newItems); 
        }
      }

      setIsReviewOpen(false); 
      setSelectedPlace(null); 
      setTargetLocation(null); 

    } catch (e) {
      console.error(e);
      alert("저장에 실패했습니다.");
    }
  };

  // 내 위치 버튼
  const handleMyLocationClick = () => {
    if (currentGPS) setTargetLocation({ lat: currentGPS.lat, lng: currentGPS.lng });
    else alert("GPS를 켜주세요.");
  };

  // 히스토리 항목 클릭 시 지도 이동
  const handleHistoryItemClick = (review: any) => {
    setTargetLocation({ lat: review.lat, lng: review.lng });
    setIsHistoryOpen(false);
  };

  // ✅ [중요] 마커 클릭 핸들러 (상세창 열기)
  const handleMarkerClick = (clickedReview: any) => {
    console.log("App.tsx: 마커 클릭됨", clickedReview); // 디버깅용 로그

    if (!clickedReview || !clickedReview.placeName) return;

    // 해당 장소 이름으로 된 리뷰들만 필터링해서 상세창에 전달
    const placeReviews = reviews.filter(r => r.placeName === clickedReview.placeName);
    
    // 최신순 정렬
    placeReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setSelectedPlaceReviews(placeReviews);
    setIsDetailOpen(true); // 상세창 열기
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId: string) => {
      try {
        await deleteDoc(doc(db, "reviews", reviewId));
        alert("삭제되었습니다.");
        setIsDetailOpen(false);
      } catch (e) { alert("오류 발생"); }
  };

  if (initChecking) return <div />;

  const myStats = {
      reviewCount: reviews.filter(r => r.userId === myProfile?.uid).length,
      likeCount: 0,
      followerCount: 0
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      
      {/* 지도 컨테이너: 마커 클릭 이벤트를 받아서 handleMarkerClick 실행 */}
      <MapContainer 
        targetLoc={targetLocation} 
        reviews={reviews} 
        onMarkerClick={handleMarkerClick}
        onMapClick={handleMapClick}
      />
      
      {/* 축하 모달 */}
      {celebrationData && (
        <CelebrationModal 
          newAchievements={celebrationData} 
          onClose={() => setCelebrationData(null)} 
        />
      )}

      {/* 장소 이름 입력 모달 */}
      {isNameInputOpen && pendingLocation && (
        <NameInputModal 
          address={pendingLocation.address}
          onClose={() => setIsNameInputOpen(false)}
          onSubmit={handleNameSubmit}
        />
      )}

      {/* 닉네임 설정 모달 (비로그인 시) */}
      {!isLoggedIn && <NicknameModal onLoginSuccess={() => window.location.reload()} />}
      
      {/* 가이드 모달 */}
      {isLoggedIn && isGuideOpen && (
        <GuideModal onClose={() => { 
          setIsGuideOpen(false); 
          localStorage.setItem('hasSeenGuide', 'true'); 
        }} />
      )}

      {/* 메인 UI (버튼들) */}
      {isLoggedIn && myProfile && !isReviewOpen && (
        <MainUI 
          profile={myProfile} 
          stats={myStats}
          onSearchClick={() => setIsSearchOpen(true)}
          onMyLocationClick={handleMyLocationClick}
          onHistoryClick={() => setIsHistoryOpen(true)}
          onTitleClick={() => setIsTitleModalOpen(true)}
          onQuestClick={() => setIsAchievementOpen(true)}
          onGuideClick={handleOpenGuide} 
        />
      )}

      {/* 칭호 모달 */}
      {isTitleModalOpen && myProfile && (
        <TitleModal 
            myTitles={myProfile.availableTitles || []}
            currentTitle={myProfile.title || '초보 모험가'}
            onClose={() => setIsTitleModalOpen(false)}
            onSelectTitle={handleChangeTitle}
        />
      )}

      {/* 업적 모달 */}
      {isAchievementOpen && myProfile && (
        <AchievementModal 
            onClose={() => setIsAchievementOpen(false)}
            myAchievements={myProfile.achievements || []}
        />
      )}

      {/* 검색 모달 */}
      {isSearchOpen && (
        <SearchModal 
          onClose={() => setIsSearchOpen(false)}
          reviews={reviews} 
          onSelectPlace={(place) => {
            const foodKeywords = ['식당', '카페', '디저트', '술집', '음식점', '베이커리', '요리', '주점', '빵집', '분식', '한식', '중식', '일식', '양식', '아시아', '패스트푸드'];
            if (!foodKeywords.some(k => place.category.includes(k))) {
              alert("현재는 식당, 카페 등 먹는 장소만 가능합니다.");
              return;
            }
            const newPos = { lat: Number(place.lat), lng: Number(place.lng) };
            setTargetLocation(newPos);
            setSelectedPlace({ ...place, lat: newPos.lat, lng: newPos.lng });
            setIsSearchOpen(false);
            // 검색 후 지도 이동 -> 조금 뒤에 리뷰 작성창 열기
            setTimeout(() => setIsReviewOpen(true), 600); 
          }}
        />
      )}

      {/* 리뷰 작성 모달 */}
      {isReviewOpen && selectedPlace && (
        <ReviewModal 
          place={selectedPlace}
          onClose={() => { setIsReviewOpen(false); setSelectedPlace(null); setTargetLocation(null); }}
          onSubmit={handleSaveReview}
        />
      )}

      {/* ✅ 리뷰 상세 보기 모달 (마커 클릭 시 열림) */}
      {isDetailOpen && selectedPlaceReviews.length > 0 && (
        <ReviewDetailModal 
          reviews={selectedPlaceReviews}
          onClose={() => setIsDetailOpen(false)}
          currentUser={myProfile ? `${myProfile.nickname} ${myProfile.tag}` : ''}
          currentUserId={myProfile?.uid}
          onDelete={handleDeleteReview}
        />
      )}

      {/* 내 기록 모달 */}
      {isHistoryOpen && myProfile && (
        <MyHistoryModal 
          reviews={reviews.filter(r => r.userId === myProfile.uid)}
          onClose={() => setIsHistoryOpen(false)}
          onReviewClick={handleHistoryItemClick}
          onDelete={handleDeleteReview}
        />
      )}
    </div>
  );
}

export default App;