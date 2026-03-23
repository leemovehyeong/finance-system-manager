'use client';

import TicketDetailView from '@/components/ticket/TicketDetailView';

export default function FieldTicketDetailPage({ params }: { params: { id: string } }) {
  return <TicketDetailView ticketId={params.id} basePath="/field" />;
}
