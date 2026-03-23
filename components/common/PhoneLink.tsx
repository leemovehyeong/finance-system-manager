import { formatPhone } from '@/lib/utils';

interface PhoneLinkProps {
  phone: string | null;
  className?: string;
}

export default function PhoneLink({ phone, className }: PhoneLinkProps) {
  if (!phone) return null;

  const cleaned = phone.replace(/[^0-9]/g, '');

  return (
    <a
      href={`tel:${cleaned}`}
      className={`text-[#007AFF] font-medium press-effect ${className || ''}`}
      onClick={(e) => e.stopPropagation()}
    >
      {formatPhone(phone)}
    </a>
  );
}
