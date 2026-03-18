import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) return null;

  return (
    <nav className="hidden md:flex items-center gap-1.5 text-sm">
      <Link to="/" className="text-gray-400 hover:text-gray-600">
        <Home className="h-4 w-4" />
      </Link>
      {pathSegments.map((segment, index) => {
        const path = '/' + pathSegments.slice(0, index + 1).join('/');
        const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        const isLast = index === pathSegments.length - 1;

        return (
          <div key={path} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            {isLast ? (
              <span className="font-medium text-gray-700">{label}</span>
            ) : (
              <Link to={path} className="text-gray-400 hover:text-gray-600">{label}</Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
