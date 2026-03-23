'use client';

import { useState } from 'react';
import { getKakaoNaviUrl } from '@/lib/kakao-map';
import { TICKET_TYPES } from '@/lib/constants';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import type { Ticket } from '@/types';

interface RouteOptimizerProps {
  tickets: Ticket[];
}

interface OptimizedStop {
  ticket: Ticket;
  lat: number;
  lng: number;
  distance?: number; // km
}

/** 간단한 nearest-neighbor 알고리즘으로 동선 최적화 */
function optimizeRoute(tickets: Ticket[], startLat: number, startLng: number): OptimizedStop[] {
  const stops: OptimizedStop[] = tickets
    .filter((t) => t.store?.latitude && t.store?.longitude)
    .map((t) => ({
      ticket: t,
      lat: t.store!.latitude!,
      lng: t.store!.longitude!,
    }));

  if (stops.length <= 1) return stops;

  const optimized: OptimizedStop[] = [];
  const remaining = [...stops];
  let currentLat = startLat;
  let currentLng = startLng;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    remaining.forEach((stop, idx) => {
      const dist = haversineDistance(currentLat, currentLng, stop.lat, stop.lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = idx;
      }
    });

    const next = remaining.splice(nearestIdx, 1)[0];
    next.distance = nearestDist;
    optimized.push(next);
    currentLat = next.lat;
    currentLng = next.lng;
  }

  return optimized;
}

/** Haversine 공식 (두 좌표 간 거리, km) */
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function RouteOptimizer({ tickets }: RouteOptimizerProps) {
  const [route, setRoute] = useState<OptimizedStop[] | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOptimize = () => {
    setLoading(true);

    // 현재 위치 사용 시도, 실패 시 여수 중심
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const result = optimizeRoute(tickets, pos.coords.latitude, pos.coords.longitude);
          setRoute(result);
          setLoading(false);
        },
        () => {
          // 위치 거부 시 여수 중심
          const result = optimizeRoute(tickets, 34.7604, 127.6622);
          setRoute(result);
          setLoading(false);
        },
        { timeout: 5000 }
      );
    } else {
      const result = optimizeRoute(tickets, 34.7604, 127.6622);
      setRoute(result);
      setLoading(false);
    }
  };

  const validTickets = tickets.filter((t) => t.store?.latitude && t.store?.longitude);

  if (validTickets.length === 0) return null;

  return (
    <div className="space-y-3">
      <Button
        size="lg"
        variant="secondary"
        className="w-full"
        onClick={handleOptimize}
        loading={loading}
      >
        동선 짜기 ({validTickets.length}건)
      </Button>

      {route && route.length > 0 && (
        <Card padding={false}>
          <div className="p-4 pb-2">
            <h3 className="text-sm font-semibold text-ios-text">최적 동선</h3>
            <p className="text-xs text-ios-subtext mt-0.5">
              총 {route.reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1)}km
            </p>
          </div>
          <div className="divide-y divide-[#F2F2F7]">
            {route.map((stop, idx) => (
              <div key={stop.ticket.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-7 h-7 rounded-full bg-[#007AFF] text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ios-text truncate">
                    {stop.ticket.store_name}
                  </p>
                  <p className="text-xs text-ios-subtext">
                    {TICKET_TYPES[stop.ticket.type].label} · {stop.distance ? `${stop.distance.toFixed(1)}km` : ''}
                  </p>
                </div>
                <a
                  href={getKakaoNaviUrl(stop.ticket.store_name, stop.lat, stop.lng)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#F2F2F7] rounded-lg text-xs font-medium text-[#007AFF] press-effect flex-shrink-0"
                >
                  출발
                </a>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
