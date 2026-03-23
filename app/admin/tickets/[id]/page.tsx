'use client';

import TicketDetailView from '@/components/ticket/TicketDetailView';

export default function AdminTicketDetailPage({ params }: { params: { id: string } }) {
  return <TicketDetailView ticketId={params.id} basePath="/admin" />;
}
