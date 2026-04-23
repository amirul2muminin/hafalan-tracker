import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BalanceStatus } from '@/lib/analytics-utils';

export const TrendIcon = ({ dir }: { dir: 'up' | 'down' | 'stable' }) => {
  if (dir === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
  if (dir === 'down') return <TrendingDown className="w-4 h-4 text-destructive" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
};

export const GrowthBadge = ({ value, suffix = '%' }: { value: number; suffix?: string }) => (
  <span className={cn(
    'text-xs font-semibold px-1.5 py-0.5 rounded-full',
    value > 0 && 'bg-success/15 text-success',
    value < 0 && 'bg-destructive/15 text-destructive',
    value === 0 && 'bg-muted text-muted-foreground',
  )}>
    {value > 0 ? '+' : ''}{Math.round(value)}{suffix}
  </span>
);

export const MetricCard = ({ label, value, sub, icon, className }: { label: string; value: string | number; sub?: React.ReactNode; icon?: React.ReactNode; className?: string }) => (
  <div className={cn('bg-card rounded-xl p-3 border border-border', className)}>
    <div className="flex items-center gap-2 mb-1">
      {icon}
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-xl font-bold text-foreground">{value}</p>
    {sub && <div className="mt-1">{sub}</div>}
  </div>
);

export const PrepBenchmarkBadge = ({ benchmark }: { benchmark: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    excellent: { label: 'Excellent', cls: 'bg-success/15 text-success' },
    normal: { label: 'Normal', cls: 'bg-hafalan-light text-hafalan-foreground' },
    slow: { label: 'Lambat', cls: 'bg-warning/15 text-warning-foreground' },
    critical: { label: 'Kritis', cls: 'bg-destructive/15 text-destructive' },
    none: { label: '-', cls: 'bg-muted text-muted-foreground' },
  };
  const { label, cls } = map[benchmark] || map.none;
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cls)}>{label}</span>;
};

export const BalanceBadge = ({ status }: { status: BalanceStatus }) => {
  const map: Record<BalanceStatus, { label: string; cls: string }> = {
    balanced: { label: 'Seimbang ✓', cls: 'bg-success/15 text-success' },
    hafalan_heavy: { label: 'Hafalan > Murojaah', cls: 'bg-warning/15 text-warning-foreground' },
    murojaah_heavy: { label: 'Murojaah > Hafalan', cls: 'bg-hafalan-light text-hafalan-foreground' },
    no_data: { label: 'Belum ada data', cls: 'bg-muted text-muted-foreground' },
  };
  const { label, cls } = map[status];
  return <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', cls)}>{label}</span>;
};
