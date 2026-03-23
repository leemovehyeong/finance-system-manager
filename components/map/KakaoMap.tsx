'use client';

import { useEffect, useRef, useState } from 'react';
import { loadKakaoMapScript, getMarkerColor, getKakaoNaviUrl } from '@/lib/kakao-map';
import { TICKET_TYPES, TICKET_STATUS } from '@/lib/constants';
import type { Ticket } from '@/types';
import Skeleton from '@/components/ui/Skeleton';

interface KakaoMapProps {
  tickets: Ticket[];
  basePath: string;
  onTicketClick?: (ticketId: string) => void;
  className?: string;
}

export default function KakaoMap({ tickets, onTicketClick, className }: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<kakao.maps.Map | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const markersRef = useRef<kakao.maps.Marker[]>([]);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);

  useEffect(() => {
    initMap();
  }, []);

  useEffect(() => {
    if (mapInstance) {
      updateMarkers();
    }
  }, [mapInstance, tickets]);

  const initMap = async () => {
    try {
      await loadKakaoMapScript();

      if (!mapRef.current) return;

      // 여수 중심 좌표
      const center = new window.kakao.maps.LatLng(34.7604, 127.6622);
      const map = new window.kakao.maps.Map(mapRef.current, {
        center,
        level: 9,
      });

      setMapInstance(map);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : '지도 로드 실패');
      setLoading(false);
    }
  };

  const updateMarkers = () => {
    if (!mapInstance) return;

    // 기존 마커 제거
    markersRef.current.forEach((m) => m.setMap(null));
    overlaysRef.current.forEach((o) => o.setMap(null));
    markersRef.current = [];
    overlaysRef.current = [];

    const bounds = new window.kakao.maps.LatLngBounds();
    let hasMarkers = false;

    tickets.forEach((ticket) => {
      // store에 좌표가 있는 경우만 마커 표시
      if (!ticket.store?.latitude || !ticket.store?.longitude) return;

      const position = new window.kakao.maps.LatLng(
        ticket.store.latitude,
        ticket.store.longitude
      );

      const color = getMarkerColor(ticket);
      const typeLabel = TICKET_TYPES[ticket.type].label;
      const statusLabel = TICKET_STATUS[ticket.status].label;

      // SVG 마커 이미지
      const markerSvg = `data:image/svg+xml,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
          <path d="M14 0C6.268 0 0 6.268 0 14c0 10.5 14 26 14 26s14-15.5 14-26C28 6.268 21.732 0 14 0z" fill="${color}"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      `)}`;

      const markerImage = new window.kakao.maps.MarkerImage(
        markerSvg,
        new window.kakao.maps.Size(28, 40),
        { offset: new window.kakao.maps.Point(14, 40) }
      );

      const marker = new window.kakao.maps.Marker({
        position,
        map: mapInstance,
        image: markerImage,
      });

      // 정보창 (커스텀 오버레이)
      const naviUrl = getKakaoNaviUrl(ticket.store_name, ticket.store.latitude, ticket.store.longitude);

      const content = document.createElement('div');
      content.innerHTML = `
        <div style="
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
          padding: 14px 16px;
          min-width: 200px;
          max-width: 260px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <div style="display:flex; align-items:center; gap:6px; margin-bottom:8px;">
            <span style="
              display:inline-block;
              padding:2px 8px;
              border-radius:20px;
              font-size:11px;
              font-weight:600;
              color:${color};
              background:${color}1A;
            ">${typeLabel}</span>
            <span style="
              display:inline-block;
              padding:2px 8px;
              border-radius:20px;
              font-size:11px;
              font-weight:600;
              color:${TICKET_STATUS[ticket.status].color};
              background:${TICKET_STATUS[ticket.status].color}1A;
            ">${statusLabel}</span>
          </div>
          <p style="font-size:14px; font-weight:600; color:#1C1C1E; margin:0 0 4px;">${ticket.store_name}</p>
          <p style="font-size:12px; color:#8E8E93; margin:0 0 10px; line-clamp:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${ticket.title}</p>
          <div style="display:flex; gap:6px;">
            <button id="detail-${ticket.id}" style="
              flex:1;
              height:34px;
              background:#007AFF;
              color:white;
              border:none;
              border-radius:10px;
              font-size:12px;
              font-weight:600;
              cursor:pointer;
            ">상세보기</button>
            <a href="${naviUrl}" target="_blank" style="
              flex:1;
              height:34px;
              background:#F2F2F7;
              color:#007AFF;
              border:none;
              border-radius:10px;
              font-size:12px;
              font-weight:600;
              cursor:pointer;
              text-decoration:none;
              display:flex;
              align-items:center;
              justify-content:center;
            ">내비출발</a>
          </div>
          <div style="
            position:absolute;
            bottom:-8px;
            left:50%;
            transform:translateX(-50%);
            width:0;
            height:0;
            border-left:8px solid transparent;
            border-right:8px solid transparent;
            border-top:8px solid white;
          "></div>
        </div>
      `;

      const overlay = new window.kakao.maps.CustomOverlay({
        content,
        position,
        yAnchor: 1.3,
        xAnchor: 0.5,
      });

      // 상세보기 버튼 클릭
      setTimeout(() => {
        const detailBtn = content.querySelector(`#detail-${ticket.id}`);
        if (detailBtn) {
          detailBtn.addEventListener('click', () => {
            if (onTicketClick) {
              onTicketClick(ticket.id);
            }
          });
        }
      }, 0);

      // 마커 클릭 → 오버레이 토글
      let isOpen = false;
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 오버레이 닫기
        overlaysRef.current.forEach((o) => o.setMap(null));

        if (!isOpen) {
          overlay.setMap(mapInstance);
          isOpen = true;
        } else {
          overlay.setMap(null);
          isOpen = false;
        }
      });

      markersRef.current.push(marker);
      overlaysRef.current.push(overlay);
      bounds.extend(position);
      hasMarkers = true;
    });

    if (hasMarkers) {
      mapInstance.setBounds(bounds, 60, 60, 60, 60);
    }
  };

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-[#F2F2F7] rounded-2xl ${className || 'h-[400px]'}`}>
        <p className="text-sm text-ios-subtext">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      {loading && (
        <div className="absolute inset-0 z-10">
          <Skeleton className="w-full h-full rounded-2xl" />
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}
