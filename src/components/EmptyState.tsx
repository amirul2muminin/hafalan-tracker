import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

const EmptyState = ({ icon, title, description, action, className }: EmptyStateProps) => (
  <div className={cn('flex flex-col items-center justify-center py-12 px-6 text-center', className)}>
    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="text-sm font-semibold text-foreground mb-1">{title}</p>
    {description && <p className="text-xs text-muted-foreground mb-4">{description}</p>}
    {action}
  </div>
);

export default EmptyState;
