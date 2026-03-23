'use client';

import TicketDetailView from '@/components/ticket/TicketDetailView';

export default function OfficeTicketDetailPage({ params }: { params: { id: string } }) {
  return <TicketDetailView ticketId={params.id} basePath="/office" />;
}
