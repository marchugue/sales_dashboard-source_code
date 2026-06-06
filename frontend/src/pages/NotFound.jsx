import { Link } from 'react-router-dom';
import { BarChart3, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-6">
          <BarChart3 className="w-10 h-10 text-primary-600" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-semibold text-slate-700 mb-4">Page not found</h2>
        <p className="text-slate-500 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <Link to="/">
          <Button className="inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export { NotFound as default };
