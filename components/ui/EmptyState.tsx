interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon = '📋', title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-ios-text mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ios-subtext text-center">{description}</p>
      )}
    </div>
  );
}
