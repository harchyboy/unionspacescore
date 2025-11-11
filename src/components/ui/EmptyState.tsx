import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: string | React.ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && (
        <div className="mb-4 text-secondary">
          {typeof icon === 'string' ? (
            <i className={`fa-solid ${icon} text-4xl`}></i>
          ) : (
            icon
          )}
        </div>
      )}
      <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>
      {description && <p className="text-sm text-secondary mb-6 max-w-md">{description}</p>}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

