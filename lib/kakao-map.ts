/** 카카오맵 SDK 스크립트 로드 */
export function loadKakaoMapScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const key = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!key) {
      reject(new Error('NEXT_PUBLIC_KAKAO_MAP_KEY가 설정되지 않았습니다.'));
      return;
    }

    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=services`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        resolve();
      });
    };
    script.onerror = () => reject(new Error('카카오맵 SDK 로드 실패'));
    document.head.appendChild(script);
  });
}

/** 주소 → 위도/경도 변환 */
export function addressToCoords(address: string): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        resolve({
          lat: parseFloat(result[0].y),
          lng: parseFloat(result[0].x),
        });
      } else {
        resolve(null);
      }
    });
  });
}

/** 카카오내비 앱 연결 URL */
export function getKakaoNaviUrl(name: string, lat: number, lng: number): string {
  return `https://map.kakao.com/link/to/${encodeURIComponent(name)},${lat},${lng}`;
}

/** 마커 색상 (상태별) */
export const MARKER_COLORS: Record<string, string> = {
  urgent_pending: '#FF3B30',   // 긴급 대기 🔴
  pending: '#FF9500',          // 일반 대기 🟡
  accepted: '#007AFF',         // 처리 중 🔵
  in_progress: '#007AFF',      // 처리 중 🔵
  install: '#34C759',          // 설치 예정 🟢
};

export function getMarkerColor(ticket: { type: string; status: string; priority: string }): string {
  if (ticket.type === 'install') return MARKER_COLORS.install;
  if (ticket.priority === 'urgent' && ticket.status === 'pending') return MARKER_COLORS.urgent_pending;
  return MARKER_COLORS[ticket.status] || MARKER_COLORS.pending;
}
