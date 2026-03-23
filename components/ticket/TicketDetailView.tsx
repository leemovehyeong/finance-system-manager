'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { TICKET_STATUS, TICKET_SOURCE, EQUIPMENT_TYPES } from '@/lib/constants';
import TopBar from '@/components/layout/TopBar';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import TicketStatusBadge from './TicketStatusBadge';
import TicketTypeBadge from './TicketTypeBadge';
import PriorityIndicator from './PriorityIndicator';
import PhoneLink from '@/components/common/PhoneLink';
import ImageUpload from '@/components/common/ImageUpload';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { timeAgo, formatDate } from '@/lib/utils';
import type { Ticket, TicketComment, TicketStatus } from '@/types';

interface TicketDetailViewProps {
  ticketId: string;
  basePath: string;
}

export default function TicketDetailView({ ticketId, basePath }: TicketDetailViewProps) {
  const { employee } = useAuth();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentImages, setCommentImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchTicket();
    fetchComments();
    subscribeToChanges();
  }, [ticketId]);

  const fetchTicket = async () => {
    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        created_by_employee:employees!tickets_created_by_fkey(id, name, phone),
        assigned_to_employee:employees!tickets_assigned_to_fkey(id, name, phone)
      `)
      .eq('id', ticketId)
      .single();

    setTicket(data);
    setLoading(false);
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('ticket_comments')
      .select('*, employee:employees(id, name, profile_image)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    setComments(data || []);
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel(`ticket-${ticketId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets', filter: `id=eq.${ticketId}` }, () => {
        fetchTicket();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'ticket_comments', filter: `ticket_id=eq.${ticketId}` }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleStatusChange = async (newStatus: TicketStatus) => {
    if (!employee || !ticket) return;

    const updates: Record<string, unknown> = { status: newStatus };

    if (newStatus === 'accepted') {
      updates.assigned_to = employee.id;
      updates.accepted_at = new Date().toISOString();
    }
    if (newStatus === 'completed') {
      updates.completed_at = new Date().toISOString();
    }

    await supabase.from('tickets').update(updates).eq('id', ticketId);

    // 용지 티켓 완료 시 자동 차감
    if (newStatus === 'completed' && ticket.type === 'paper' && ticket.paper_type && ticket.paper_quantity) {
      await fetch('/api/paper-deduct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket_id: ticketId,
          paper_type: ticket.paper_type,
          quantity: ticket.paper_quantity,
          employee_id: employee.id,
          store_name: ticket.store_name,
        }),
      });
    }

    // 시스템 댓글
    const statusLabel = TICKET_STATUS[newStatus].label;
    await supabase.from('ticket_comments').insert({
      ticket_id: ticketId,
      employee_id: employee.id,
      content: `${employee.name}님이 상태를 "${statusLabel}"(으)로 변경했습니다.`,
      is_system: true,
    });

    fetchTicket();
  };

  const handleComment = async () => {
    if (!employee || (!newComment.trim() && commentImages.length === 0)) return;
    setSubmitting(true);

    await supabase.from('ticket_comments').insert({
      ticket_id: ticketId,
      employee_id: employee.id,
      content: newComment.trim(),
      images: commentImages.length > 0 ? commentImages : null,
    });

    setNewComment('');
    setCommentImages([]);
    setSubmitting(false);
    fetchComments();
  };

  if (loading) {
    return (
      <div className="px-5 pt-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!ticket) {
    return (
      <>
        <TopBar title="티켓 상세" showBack />
        <div className="flex items-center justify-center h-[60vh]">
          <p className="text-ios-subtext">티켓을 찾을 수 없습니다.</p>
        </div>
      </>
    );
  }

  const isField = basePath === '/field';
  const isAdmin = basePath === '/admin';
  const canAccept = isField && ticket.status === 'pending';
  const canComplete = (isField || isAdmin) && (ticket.status === 'accepted' || ticket.status === 'in_progress');
  const canCancel = isAdmin && ticket.status !== 'completed' && ticket.status !== 'cancelled';

  return (
    <>
      <TopBar title={`#${ticket.ticket_number}`} showBack />

      <div className="px-5 py-6 space-y-4">
        {/* 상태 & 유형 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TicketTypeBadge type={ticket.type} />
              <PriorityIndicator priority={ticket.priority} />
              {TICKET_SOURCE[ticket.source].badge && (
                <span className="text-xs text-[#007AFF] font-medium">
                  {TICKET_SOURCE[ticket.source].badge}
                </span>
              )}
            </div>
            <TicketStatusBadge status={ticket.status} />
          </div>

          <h2 className="text-xl font-semibold text-ios-text mb-2">
            {ticket.title}
          </h2>

          {ticket.description && (
            <p className="text-sm text-ios-subtext leading-relaxed mb-4">
              {ticket.description}
            </p>
          )}

          {/* 이미지 */}
          {ticket.images && ticket.images.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {ticket.images.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`첨부 ${i + 1}`}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
              ))}
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-ios-subtext">거래처</span>
              <span className="text-ios-text font-medium">{ticket.store_name}</span>
            </div>
            {ticket.store_phone && (
              <div className="flex justify-between">
                <span className="text-ios-subtext">전화</span>
                <PhoneLink phone={ticket.store_phone} />
              </div>
            )}
            {ticket.store_address && (
              <div className="flex justify-between">
                <span className="text-ios-subtext">주소</span>
                <span className="text-ios-text text-right max-w-[60%]">{ticket.store_address}</span>
              </div>
            )}
            {ticket.equipment_type && (
              <div className="flex justify-between">
                <span className="text-ios-subtext">장비</span>
                <span className="text-ios-text">{EQUIPMENT_TYPES[ticket.equipment_type].label}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-ios-subtext">접수</span>
              <span className="text-ios-text">{formatDate(ticket.created_at)}</span>
            </div>
            {ticket.created_by_employee && (
              <div className="flex justify-between">
                <span className="text-ios-subtext">접수자</span>
                <span className="text-ios-text">{ticket.created_by_employee.name}</span>
              </div>
            )}
            {ticket.assigned_to_employee && (
              <div className="flex justify-between">
                <span className="text-ios-subtext">담당자</span>
                <div className="flex items-center gap-2">
                  <span className="text-ios-text">{ticket.assigned_to_employee.name}</span>
                  <PhoneLink phone={ticket.assigned_to_employee.phone ?? null} />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 액션 버튼 */}
        {(canAccept || canComplete || canCancel) && (
          <div className="flex gap-3">
            {canAccept && (
              <Button size="lg" className="flex-1" onClick={() => handleStatusChange('accepted')}>
                수락하기
              </Button>
            )}
            {canComplete && (
              <Button size="lg" className="flex-1" onClick={() => handleStatusChange('completed')}>
                완료 처리
              </Button>
            )}
            {canCancel && (
              <Button size="lg" variant="danger" className="flex-1" onClick={() => handleStatusChange('cancelled')}>
                취소
              </Button>
            )}
          </div>
        )}

        {/* 댓글 */}
        <div>
          <h3 className="text-base font-semibold text-ios-text mb-3">댓글</h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <Card key={comment.id} className={comment.is_system ? 'bg-[#F2F2F7]' : ''}>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-medium ${comment.is_system ? 'text-ios-subtext' : 'text-ios-text'}`}>
                    {comment.employee?.name || '시스템'}
                  </span>
                  <span className="text-xs text-ios-subtext">{timeAgo(comment.created_at)}</span>
                </div>
                <p className={`text-sm ${comment.is_system ? 'text-ios-subtext italic' : 'text-ios-text'}`}>
                  {comment.content}
                </p>
                {comment.images && comment.images.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {comment.images.map((url, i) => (
                      <img key={i} src={url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                    ))}
                  </div>
                )}
              </Card>
            ))}
            <div ref={commentsEndRef} />
          </div>
        </div>

        {/* 댓글 입력 */}
        {ticket.status !== 'cancelled' && (
          <div className="space-y-3">
            <ImageUpload
              bucket="ticket-images"
              folder={`comments/${ticketId}`}
              existingImages={commentImages}
              onUpload={(url) => setCommentImages((prev) => [...prev, url])}
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="flex-1 h-[44px] px-4 bg-[#F2F2F7] rounded-xl text-ios-text placeholder:text-ios-subtext focus:outline-none focus:ring-2 focus:ring-[#007AFF]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleComment();
                  }
                }}
              />
              <Button
                size="md"
                onClick={handleComment}
                loading={submitting}
                disabled={!newComment.trim() && commentImages.length === 0}
              >
                전송
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
