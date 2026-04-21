import { Home, Users, BarChart3, Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const tabs = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/students', icon: Users, label: 'Murid' },
  { path: '/add', icon: Plus, label: 'Tambah', isAction: true },
  { path: '/analytics', icon: BarChart3, label: 'Analitik' },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          const active = pathname === tab.path;
          if (tab.isAction) {
            return (
              <button key={tab.path} onClick={() => navigate(tab.path)} className="flex flex-col items-center gap-0.5 -mt-4">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <tab.icon className="w-6 h-6 text-primary-foreground" />
                </div>
              </button>
            );
          }
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} className="flex flex-col items-center gap-0.5 py-1 px-3 min-w-[4rem]">
              <tab.icon className={cn('w-5 h-5 transition-colors', active ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[10px] font-medium transition-colors', active ? 'text-primary' : 'text-muted-foreground')}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
