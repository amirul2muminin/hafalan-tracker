import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  action?: React.ReactNode;
}

const PageHeader = ({ title, subtitle, back, action }: PageHeaderProps) => {
  const navigate = useNavigate();
  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {back && (
            <button onClick={() => navigate(-1)} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-bold text-foreground">{title}</h1>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
    </div>
  );
};

export default PageHeader;
