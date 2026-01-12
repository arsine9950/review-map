import { useState, useEffect } from 'react';
import { FaSearch, FaTimes, FaMapMarkerAlt, FaStar, FaUser, FaUtensils } from 'react-icons/fa';
import './MainUI.css';

interface SearchModalProps {
  onClose: () => void;
  onSelectPlace: (place: {
    name: string;
    lat: number;
    lng: number;
    category: string;
    address: string;
  }) => void;
  reviews: any[]; 
}

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

const SearchModal = ({ onClose, onSelectPlace, reviews }: SearchModalProps) => {
  const [keyword, setKeyword] = useState('');
  
  const [searchType, setSearchType] = useState<'place' | 'review'>('place');
  const [placeResults, setPlaceResults] = useState<any[]>([]); 
  const [reviewResults, setReviewResults] = useState<any[]>([]); 
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setKeyword('');
    setPlaceResults([]);
    setReviewResults([]);
  }, [searchType]);

  // =========================================================
  // 1. 장소 검색 로직 (Netlify Function)
  // =========================================================
  const getCurrentPosition = (): Promise<GeolocationPosition | null> => {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), {
        enableHighAccuracy: true, timeout: 5000, maximumAge: 0
      });
    });
  };

  const getCurrentRegion = (): Promise<string> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(''); return; }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const { naver } = window as any;
          if (!naver || !naver.maps?.Service) { resolve(''); return; }
          const coord = new naver.maps.LatLng(latitude, longitude);
          naver.maps.Service.reverseGeocode(
            { coords: coord, orders: [naver.maps.Service.OrderType.ADM_CODE, naver.maps.Service.OrderType.ROAD_ADDR].join(',') },
            (status: any, response: any) => {
              if (status === naver.maps.Service.Status.OK) {
                try {
                  const result = response?.v2?.results?.[0];
                  const region = result?.region;
                  const area2 = region?.area2?.name ?? '';
                  const area3 = region?.area3?.name ?? '';
                  resolve(`${area2} ${area3}`.trim());
                } catch { resolve(''); }
              } else { resolve(''); }
            }
          );
        },
        () => resolve(''),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 60_000 }
      );
    });
  };

  const handlePlaceSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) return;

    setPlaceResults([]);
    setLoading(true);

    try {
      const pos = await getCurrentPosition();
      const myLat = pos ? pos.coords.latitude : 37.3595704;
      const myLng = pos ? pos.coords.longitude : 127.105399;

      const currentRegion = await getCurrentRegion();
      let finalQuery = keyword.trim();

      if (currentRegion) {
        const area3 = currentRegion.split(' ')[1];
        if (area3 && !finalQuery.includes(area3)) {
          finalQuery = `${currentRegion} ${finalQuery}`;
        }
      }

      // ✅ Netlify Function 호출
      // 주의: 로컬 테스트 시에는 'netlify dev'로 실행해야 작동합니다.
      // 배포 후에는 Netlify 환경변수(NAVER_CLIENT_ID 등)가 설정되어 있어야 합니다.
      const res = await fetch(`/.netlify/functions/search?query=${encodeURIComponent(finalQuery)}&display=10`);
      
      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }
      
      const data = await res.json();

      if (Array.isArray(data?.items)) {
        const processedResults = data.items.map((item: any) => {
          const coords = transformCoords(item.mapx, item.mapy);
          const dist = getDistance(myLat, myLng, coords.lat, coords.lng);
          return { ...item, lat: coords.lat, lng: coords.lng, distance: dist };
        });
        processedResults.sort((a: any, b: any) => a.distance - b.distance);
        setPlaceResults(processedResults);
      } else {
        setPlaceResults([]);
      }
    } catch (err) {
      console.error("검색 실패:", err);
      alert('검색 중 오류가 발생했습니다.\n(잠시 후 다시 시도하거나, Netlify 로그를 확인하세요)');
    } finally {
      setLoading(false);
    }
  };

  const transformCoords = (mapx: any, mapy: any) => {
    const lng = Number(mapx) / 1e7; 
    const lat = Number(mapy) / 1e7; 
    return (Number.isFinite(lat) && Number.isFinite(lng)) ? { lat, lng } : { lat: 0, lng: 0 };
  };

  const isValidKoreaLatLng = (lat: number, lng: number) => lat > 33 && lat < 40 && lng > 124 && lng < 133;


  // =========================================================
  // 2. 리뷰 검색 로직
  // =========================================================
  const handleReviewSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!keyword.trim()) {
        setReviewResults([]);
        return;
    }

    const term = keyword.toLowerCase();
    const results = reviews.filter(review => {
      if (review.nickname && review.nickname.toLowerCase().includes(term)) return true;
      if (review.category && review.category.includes(term)) return true;
      if (!isNaN(Number(term)) && review.rating === Number(term)) return true;
      if (review.content && review.content.toLowerCase().includes(term)) return true;
      if (review.placeName && review.placeName.toLowerCase().includes(term)) return true;
      return false;
    });
    setReviewResults(results);
  };


  return (
    <div className="ui-overlay" style={{ 
      background: 'rgba(0,0,0,0.6)', zIndex: 2000, pointerEvents: 'auto', 
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' 
    }}>
      
      <div style={{
        width: '100%', maxWidth: '500px', 
        height: '80vh', // ✅ [핵심 수정] 높이를 화면의 80%로 고정
        background: 'white', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden' // 내용 넘침 방지
      }}>
        
        {/* === 상단 고정 영역 (탭 + 검색창) === */}
        <div style={{ flexShrink: 0, background: 'white' }}>
            
            {/* 닫기 버튼 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px 0' }}>
                <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', color: '#ccc', cursor: 'pointer', padding: '4px' }}>
                   <FaTimes />
                </button>
            </div>

            {/* 탭 버튼 */}
            <div style={{ display: 'flex', borderBottom: '1px solid #eee', marginTop: '-10px' }}>
                <button 
                    onClick={() => setSearchType('place')}
                    style={{
                        flex: 1, padding: '14px', border: 'none', background: 'none',
                        fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                        borderBottom: searchType === 'place' ? '3px solid #3182F6' : '3px solid transparent',
                        color: searchType === 'place' ? '#3182F6' : '#999',
                        transition: 'all 0.2s'
                    }}
                >
                    📍 장소 찾기
                </button>
                <button 
                    onClick={() => setSearchType('review')}
                    style={{
                        flex: 1, padding: '14px', border: 'none', background: 'none',
                        fontWeight: 'bold', fontSize: '15px', cursor: 'pointer',
                        borderBottom: searchType === 'review' ? '3px solid #3182F6' : '3px solid transparent',
                        color: searchType === 'review' ? '#3182F6' : '#999',
                        transition: 'all 0.2s'
                    }}
                >
                    📝 리뷰 찾기
                </button>
            </div>

            {/* 검색창 */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f5f5f5' }}>
                <form 
                  onSubmit={searchType === 'place' ? handlePlaceSearch : handleReviewSearch} 
                  style={{ background: '#f5f7fa', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}
                >
                    <FaSearch color="#888" size={16} onClick={() => (searchType === 'place' ? handlePlaceSearch() : handleReviewSearch())} style={{ cursor: 'pointer' }} />
                    <input 
                      type="text" 
                      placeholder={searchType === 'place' ? "장소, 주소 검색 (예: 강남역 맛집)" : "내 리뷰 검색 (키워드, 별점 등)"}
                      autoFocus 
                      value={keyword} 
                      onChange={(e) => setKeyword(e.target.value)} 
                      style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '15px' }} 
                    />
                </form>
            </div>
        </div>

        {/* === 리스트 영역 (스크롤 가능) === */}
        <div style={{ 
            flex: 1, // 남은 공간 모두 차지
            overflowY: 'auto', // ✅ 여기가 스크롤 핵심
            padding: '0 20px',
            background: '#fff'
        }}>
          
          {/* 1. 장소 검색 결과 */}
          {searchType === 'place' && (
              loading ? (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#888', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <div className="spinner" style={{ width: '30px', height: '30px', border: '3px solid #eee', borderTop: '3px solid #3182F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                    장소를 찾는 중...
                    <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : placeResults.length > 0 ? (
                placeResults.map((item, idx) => {
                  const cleanTitle = (item.title ?? '').replace(/<[^>]+>/g, '');
                  const address = item.roadAddress || item.address || '';

                  return (
                    <div key={idx} onClick={() => {
                      if (isValidKoreaLatLng(item.lat, item.lng)) {
                        onSelectPlace({ name: cleanTitle, lat: item.lat, lng: item.lng, category: item.category || '장소', address });
                      } else {
                        alert('좌표 정보가 정확하지 않습니다.');
                      }
                    }} style={{ 
                      padding: '16px 0', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' 
                    }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', overflow: 'hidden' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e8f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <FaMapMarkerAlt color="#3182F6" size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#333' }}>{cleanTitle}</span>
                          <span style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{address}</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#3182F6', background: '#f0f7ff', padding: '4px 8px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {item.distance > 1000 ? `${(item.distance / 1000).toFixed(1)}km` : `${Math.round(item.distance)}m`}
                      </div>
                    </div>
                  );
                })
              ) : keyword && (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#ccc' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔍</div>
                  검색 결과가 없습니다.
                </div>
              )
          )}

          {/* 2. 리뷰 검색 결과 */}
          {searchType === 'review' && (
              reviewResults.length > 0 ? (
                reviewResults.map((review) => (
                    <div 
                        key={review.id} 
                        onClick={() => onSelectPlace({
                            name: review.placeName,
                            address: review.address,
                            lat: review.lat,
                            lng: review.lng,
                            category: review.category
                        })}
                        style={{ 
                            padding: '16px', borderRadius: '12px', marginBottom: '10px',
                            border: '1px solid #f0f0f0', cursor: 'pointer',
                            display: 'flex', flexDirection: 'column', gap: '6px',
                            background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
                        }}
                    >   
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{review.placeName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', color: '#FFD700' }}>
                                <FaStar /> <span style={{ color: '#333', fontWeight: 'bold' }}>{review.rating}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: '#666' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaUtensils size={10} /> {review.category}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FaUser size={10} /> {review.nickname}
                            </span>
                        </div>

                        {review.content && (
                            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px', background: '#f9f9f9', padding: '8px', borderRadius: '8px' }}>
                                "{review.content.length > 30 ? review.content.substring(0, 30) + '...' : review.content}"
                            </div>
                        )}
                    </div>
                ))
              ) : keyword && (
                <div style={{ padding: '60px 0', textAlign: 'center', color: '#ccc' }}>
                  <div style={{ fontSize: '40px', marginBottom: '10px' }}>📝</div>
                  일치하는 리뷰가 없습니다.
                </div>
              )
          )}
        </div>

        {/* === 하단 팁 (고정 영역) === */}
        <div style={{ 
            flexShrink: 0, padding: '14px', background: '#fafafa', borderTop: '1px solid #eee', 
            fontSize: '12px', color: '#888', textAlign: 'center', fontWeight: '500' 
        }}>
            {searchType === 'place' 
                ? "찾으시는 장소가 없나요? 지도를 직접 클릭해서 추가할 수도 있어요! 👆"
                : "닉네임, 별점, 카테고리(식당, 카페 등)로 리뷰를 찾아보세요! 🔍"}
        </div>

      </div>
    </div>
  );
};

export default SearchModal;