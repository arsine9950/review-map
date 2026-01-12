import { useEffect, useRef, useState } from 'react';

interface MapContainerProps {
  targetLoc?: { lat: number; lng: number } | null;
  reviews?: any[];
  onMarkerClick?: (review: any) => void;
  onMapClick?: (location: { lat: number; lng: number; address: string }) => void;
}

const MapContainer = ({ targetLoc, reviews = [], onMarkerClick, onMapClick }: MapContainerProps) => {
  const mapElement = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  
  const markersRef = useRef<any[]>([]);
  const polylinesRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const myMarkerRef = useRef<any>(null);

  const [expandedGroupId, setExpandedGroupId] = useState<number | null>(null);

  // 1. 지도 초기화
  useEffect(() => {
    const { naver } = window as any;
    if (!mapElement.current || !naver) return;

    if (!mapRef.current) {
      const initialLocation = new naver.maps.LatLng(37.3595704, 127.105399); 
      const mapOptions = {
        center: initialLocation,
        zoom: 16,
        zoomControl: false,
        mapDataControl: false,
        logoControl: false,
      };
      
      const map = new naver.maps.Map(mapElement.current, mapOptions);
      mapRef.current = map;

      naver.maps.Event.addListener(map, 'click', (e: any) => {
        setExpandedGroupId(null);

        if (onMapClick) {
          const lat = e.coord.lat();
          const lng = e.coord.lng();

          naver.maps.Service.reverseGeocode({
            coords: e.coord,
            orders: [
              naver.maps.Service.OrderType.ADM_CODE,
              naver.maps.Service.OrderType.ROAD_ADDR
            ].join(',')
          }, (status: any, response: any) => {
            if (status === naver.maps.Service.Status.OK) {
              const result = response.v2.results[0];
              const region = result?.region;
              const land = result?.land;
              
              let address = '';
              if (land) {
                 address = `${region.area1.name} ${region.area2.name} ${land.name} ${land.number1}`;
              } else {
                 address = `${region.area1.name} ${region.area2.name} ${region.area3.name}`;
              }

              onMapClick({ lat, lng, address });
            } else {
              onMapClick({ lat, lng, address: '주소 정보 없음' });
            }
          });
        }
      });

      if (navigator.geolocation) {
        navigator.geolocation.watchPosition(
          (position) => {
            const myPos = new naver.maps.LatLng(position.coords.latitude, position.coords.longitude);
            
            if (circleRef.current) circleRef.current.setCenter(myPos);
            else {
              circleRef.current = new naver.maps.Circle({
                map: map, center: myPos, radius: 100, fillColor: '#3182F6', fillOpacity: 0.15, strokeColor: '#3182F6', strokeOpacity: 0.4, strokeWeight: 2, clickable: false,
              });
            }

            if (myMarkerRef.current) myMarkerRef.current.setPosition(myPos);
            else {
              myMarkerRef.current = new naver.maps.Marker({
                position: myPos, map: map, zIndex: 100,
                icon: { content: '<div style="width:14px;height:14px;background:#3182F6;border:2px solid white;border-radius:50%;box-shadow:0 0 4px rgba(0,0,0,0.3);"></div>', anchor: new naver.maps.Point(7, 7) },
              });
            }
          },
          (err) => console.error(err), { enableHighAccuracy: true }
        );
      }
    }
  }, []); 

  // 2. 지도 이동
  useEffect(() => {
    if (mapRef.current && targetLoc && targetLoc.lat && targetLoc.lng) {
      const { naver } = window as any;
      const destination = new naver.maps.LatLng(targetLoc.lat, targetLoc.lng);
      
      const currentZoom = mapRef.current.getZoom();
      const newZoom = currentZoom > 16 ? currentZoom : 16;
      
      mapRef.current.morph(destination, newZoom); 
    }
  }, [targetLoc]);

  // 3. 거리 기반 그룹화 및 렌더링
  useEffect(() => {
    if (!mapRef.current || !window.naver) return;
    const { naver } = window as any;

    markersRef.current.forEach(m => m.setMap(null));
    polylinesRef.current.forEach(p => p.setMap(null));
    markersRef.current = [];
    polylinesRef.current = [];

    const groups: { lat: number; lng: number; items: any[] }[] = [];
    const DISTANCE_THRESHOLD = 0.0002; 

    reviews.forEach(rev => {
      const existingGroup = groups.find(g => {
        const latDiff = Math.abs(g.lat - rev.lat);
        const lngDiff = Math.abs(g.lng - rev.lng);
        return latDiff < DISTANCE_THRESHOLD && lngDiff < DISTANCE_THRESHOLD;
      });

      if (existingGroup) {
        existingGroup.items.push(rev);
      } else {
        groups.push({ lat: rev.lat, lng: rev.lng, items: [rev] });
      }
    });

    groups.forEach((group, groupIndex) => {
      const isExpanded = groupIndex === expandedGroupId;
      const baseLat = group.lat;
      const baseLng = group.lng;
      const items = group.items;
      const count = items.length;

      if (count === 1 || !isExpanded) {
        let contentHTML = '';

        if (count > 1) {
          // ✅ [수정] 그룹 마커: preventDefault() 추가 (브라우저 기본 동작 차단)
          contentHTML = `
            <div 
              onmousedown="event.preventDefault(); event.stopPropagation();" 
              ontouchstart="event.preventDefault(); event.stopPropagation();"
              style="
                width: 40px; height: 40px; background: #3182F6; border-radius: 50%; border: 3px solid white;
                color: white; font-weight: bold; font-size: 14px; display: flex; align-items: center; justify-content: center;
                box-shadow: 0 4px 10px rgba(0,0,0,0.3); cursor: pointer;
            ">
              +${count}
            </div>
          `;
        } else {
          // ✅ [수정] 단일 마커: preventDefault() 추가
          const review = items[0];
          const placeName = review.name || review.placeName || '장소명 없음';
          const rating = review.rating ? parseFloat(review.rating).toFixed(1) : '0.0';
          const reviewCount = review.reviewCount || 1;
          
          let catIcon = '📍';
          const cat = review.category || '';
          if (cat.includes('식당')) catIcon = '🍚';
          else if (cat.includes('카페') || cat.includes('디저트')) catIcon = '☕';
          else if (cat.includes('요리주점') || cat.includes('주점') || cat.includes('바')) catIcon = '🍺';

          contentHTML = `
            <div 
              onmousedown="event.preventDefault(); event.stopPropagation();" 
              ontouchstart="event.preventDefault(); event.stopPropagation();"
              style="position:relative; cursor:pointer;"
            >
              <div style="font-size:24px; filter:drop-shadow(0 2px 5px rgba(0,0,0,0.3)); text-align:center;">📍</div>
              <div style="
                position:absolute; top:-30px; left:50%; transform:translateX(-50%);
                background:white; padding:6px 10px; border-radius:20px;
                box-shadow:0 2px 8px rgba(0,0,0,0.15); border:1px solid #eee;
                display:flex; align-items:center; gap: 6px; white-space:nowrap; z-index: 60;
              ">
                <span style="font-size:14px;">${catIcon}</span>
                <span style="font-weight:bold; color:#222; font-size:13px;">${placeName}</span>
                <div style="display:flex; align-items:center; gap:3px; font-size:12px; color:#555; margin-left:2px; border-left:1px solid #ddd; padding-left:6px;">
                  <span style="color:#FFB800;">★</span>
                  <span style="font-weight:600;">${rating}</span>
                  <span style="color:#999; font-size:11px;">(${reviewCount})</span>
                </div>
                <div style="position:absolute; bottom:-6px; left:50%; transform:translateX(-50%); width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:6px solid white;"></div>
              </div>
            </div>
          `;
        }

        const marker = new naver.maps.Marker({
          position: new naver.maps.LatLng(baseLat, baseLng),
          map: mapRef.current,
          zIndex: 50,
          icon: {
            content: contentHTML,
            anchor: new naver.maps.Point(count > 1 ? 20 : 12, count > 1 ? 20 : 12),
          }
        });

        naver.maps.Event.addListener(marker, 'click', () => {
          if (count > 1) {
            mapRef.current.setZoom(mapRef.current.getZoom() < 16 ? 17 : mapRef.current.getZoom());
            mapRef.current.panTo(new naver.maps.LatLng(baseLat, baseLng));
            setExpandedGroupId(groupIndex);
          } else {
            if (onMarkerClick) onMarkerClick(items[0]);
          }
        });

        markersRef.current.push(marker);

      } else {
        const centerMarker = new naver.maps.Marker({
          position: new naver.maps.LatLng(baseLat, baseLng),
          map: mapRef.current,
          zIndex: 40,
          icon: {
            content: `<div style="width:10px; height:10px; background:#333; border-radius:50%; opacity:0.5;"></div>`,
            anchor: new naver.maps.Point(5, 5),
          }
        });
        naver.maps.Event.addListener(centerMarker, 'click', () => setExpandedGroupId(null));
        markersRef.current.push(centerMarker);

        const RADIUS = 0.0006; 
        
        items.forEach((review, index) => {
          const angle = (index / count) * Math.PI * 2;
          const targetLat = baseLat + (Math.sin(angle) * RADIUS * 0.7);
          const targetLng = baseLng + (Math.cos(angle) * RADIUS);

          const line = new naver.maps.Polyline({
            map: mapRef.current,
            path: [new naver.maps.LatLng(baseLat, baseLng), new naver.maps.LatLng(targetLat, targetLng)],
            strokeColor: '#888', strokeOpacity: 0.5, strokeWeight: 2, strokeStyle: 'shortdash'
          });
          polylinesRef.current.push(line);

          const placeName = review.name || review.placeName || '장소명 없음';
          const rating = review.rating ? parseFloat(review.rating).toFixed(1) : '0.0';
          
          let catIcon = '📍';
          const cat = review.category || '';
          if (cat.includes('식당')) catIcon = '🍚';
          else if (cat.includes('카페') || cat.includes('디저트')) catIcon = '☕';
          else if (cat.includes('요리주점') || cat.includes('주점') || cat.includes('바')) catIcon = '🍺';

          // ✅ [수정] 펼쳐진 마커: preventDefault() 추가
          const marker = new naver.maps.Marker({
            position: new naver.maps.LatLng(targetLat, targetLng),
            map: mapRef.current,
            zIndex: 100 + index,
            icon: {
              content: `
                <div 
                  onmousedown="event.preventDefault(); event.stopPropagation();" 
                  ontouchstart="event.preventDefault(); event.stopPropagation();"
                  style="position:relative; cursor:pointer;"
                >
                  <div style="
                    background:white; padding:5px 8px; border-radius:16px;
                    box-shadow:0 2px 8px rgba(0,0,0,0.2); border:1px solid #3182F6;
                    display:flex; align-items:center; gap: 4px; white-space:nowrap;
                  ">
                    <span style="font-size:12px;">${catIcon}</span>
                    <span style="font-weight:bold; color:#222; font-size:12px; max-width:80px; overflow:hidden; text-overflow:ellipsis;">${placeName}</span>
                    <span style="font-size:11px; color:#FFB800;">★${rating}</span>
                  </div>
                </div>
              `,
              anchor: new naver.maps.Point(40, 30),
            }
          });

          marker.addListener('mouseover', () => marker.setZIndex(200));
          marker.addListener('mouseout', () => marker.setZIndex(100 + index));

          naver.maps.Event.addListener(marker, 'click', () => {
             if (onMarkerClick) onMarkerClick(review);
          });

          markersRef.current.push(marker);
        });
      }
    });

  }, [reviews, expandedGroupId, onMarkerClick]);

  return <div ref={mapElement} style={{ width: '100%', height: '100vh' }} />;
};

export default MapContainer;