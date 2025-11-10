interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-[#8e8e8e]">{icon}</div>}
      <h3 className="text-lg font-semibold text-[#252525] mb-2">{title}</h3>
      {description && <p className="text-sm text-[#8e8e8e] mb-6 max-w-md">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="bg-[#252525] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-opacity-90 transition-all"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

