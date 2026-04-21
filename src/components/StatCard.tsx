import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: 'hafalan' | 'murojaah' | 'ujian' | 'default';
}

const StatCard = ({ label, value, icon, variant = 'default' }: StatCardProps) => {
  return (
    <div className={cn(
      'rounded-xl p-4 flex items-center gap-3',
      variant === 'hafalan' && 'bg-hafalan-light',
      variant === 'murojaah' && 'bg-murojaah-light',
      variant === 'ujian' && 'bg-ujian-light',
      variant === 'default' && 'bg-card border border-border',
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        variant === 'hafalan' && 'bg-hafalan text-primary-foreground',
        variant === 'murojaah' && 'bg-murojaah text-primary-foreground',
        variant === 'ujian' && 'bg-ujian text-primary-foreground',
        variant === 'default' && 'bg-muted text-muted-foreground',
      )}>
        {icon}
      </div>
      <div>
        <p className={cn(
          'text-xs font-medium',
          variant === 'hafalan' && 'text-hafalan-foreground',
          variant === 'murojaah' && 'text-murojaah-foreground',
          variant === 'ujian' && 'text-ujian-foreground',
          variant === 'default' && 'text-muted-foreground',
        )}>{label}</p>
        <p className="text-xl font-bold text-foreground">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
