'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import { TicketCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { timeAgo } from '@/lib/utils';
import type { Notification as NotificationType } from '@/types';

interface NotificationsListProps {
  basePath: string;
}

export default function NotificationsList({ basePath }: NotificationsListProps) {
  const { employee } = useAuth();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (employee) {
      fetchNotifications();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee]);

  const fetchNotifications = async () => {
    if (!employee) return;

    try {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .or(`target.eq.all,target.eq.${employee.role},target.eq.${employee.id}`)
        .order('created_at', { ascending: false })
        .limit(50);

      setNotifications(data || []);

      // 읽음 처리
      if (data && data.length > 0) {
        const unreadIds = data.filter((n: { is_read: boolean }) => !n.is_read).map((n: { id: string }) => n.id);
        if (unreadIds.length > 0) {
          await supabase
            .from('notifications')
            .update({ is_read: true })
            .in('id', unreadIds);
        }
      }
    } catch (err) {
      console.error('Notifications fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (notification: NotificationType) => {
    if (notification.related_ticket_id) {
      router.push(`${basePath}/tickets/${notification.related_ticket_id}`);
    }
  };

  return (
    <>
      <TopBar title="알림" />

      <div className="px-5 py-4 space-y-3">
        {loading ? (
          [...Array(5)].map((_, i) => <TicketCardSkeleton key={i} />)
        ) : notifications.length === 0 ? (
          <EmptyState icon="bell" title="알림이 없습니다" />
        ) : (
          notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`press-effect cursor-pointer ${!notification.is_read ? 'border-l-4 border-[#007AFF]' : ''}`}
              onClick={() => handleClick(notification)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-ios-text mb-0.5">
                    {notification.title}
                  </p>
                  <p className="text-sm text-ios-subtext line-clamp-2">
                    {notification.body}
                  </p>
                </div>
                <span className="text-xs text-ios-subtext whitespace-nowrap flex-shrink-0">
                  {timeAgo(notification.created_at)}
                </span>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
