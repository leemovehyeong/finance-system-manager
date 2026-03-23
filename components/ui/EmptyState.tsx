import { ClipboardText, CheckCircle, Bell, MagnifyingGlass, Storefront, Package, Tray } from '@phosphor-icons/react/dist/ssr';

const iconMap = {
  clipboard: ClipboardText,
  check: CheckCircle,
  bell: Bell,
  search: MagnifyingGlass,
  store: Storefront,
  package: Package,
  tray: Tray,
};

interface EmptyStateProps {
  icon?: keyof typeof iconMap;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = 'clipboard', title, description }: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <div className="w-14 h-14 rounded-full bg-surface-secondary flex items-center justify-center mb-4">
        <Icon size={28} weight="light" className="text-text-tertiary" />
      </div>
      <h3 className="text-body font-semibold text-text-primary mb-1">{title}</h3>
      {description && (
        <p className="text-caption text-text-tertiary text-center">{description}</p>
      )}
    </div>
  );
}
