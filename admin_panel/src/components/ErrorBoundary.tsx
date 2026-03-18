import { useRouteError, isRouteErrorResponse, useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function RouteErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : error instanceof Error
    ? error.message
    : 'An unexpected error occurred';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-7 w-7 text-red-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Something went wrong</h1>
        <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 text-left font-mono break-all">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
          <Button onClick={() => navigate('/')}>Go to Dashboard</Button>
        </div>
      </div>
    </div>
  );
}
