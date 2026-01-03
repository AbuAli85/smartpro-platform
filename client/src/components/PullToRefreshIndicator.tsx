import { RefreshCw, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  isRefreshing: boolean;
  pullDistance: number;
  canRefresh: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  isPulling,
  isRefreshing,
  pullDistance,
  canRefresh,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  // Calculate progress percentage
  const progress = Math.min((pullDistance / threshold) * 100, 100);

  // Don't show anything if not pulling or refreshing
  if (!isPulling && !isRefreshing) {
    return null;
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translateY(${isRefreshing ? '0' : `-${100 - pullDistance}%`})`,
        transition: isRefreshing ? 'transform 0.3s ease-out' : 'none',
      }}
    >
      <div className="bg-white dark:bg-gray-800 rounded-full shadow-lg p-3 m-4">
        {isRefreshing ? (
          // Refreshing spinner
          <RefreshCw className="w-6 h-6 text-primary animate-spin" />
        ) : (
          // Pull indicator
          <div className="relative w-6 h-6">
            {/* Background circle */}
            <svg className="w-6 h-6 transform -rotate-90">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              {/* Progress circle */}
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 10}`}
                strokeDashoffset={`${2 * Math.PI * 10 * (1 - progress / 100)}`}
                className={cn(
                  'transition-all duration-150',
                  canRefresh
                    ? 'text-green-500 dark:text-green-400'
                    : 'text-primary'
                )}
                strokeLinecap="round"
              />
            </svg>

            {/* Arrow icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-all duration-200',
                  canRefresh
                    ? 'text-green-500 dark:text-green-400 rotate-180'
                    : 'text-primary',
                  isPulling && 'animate-bounce'
                )}
              />
            </div>
          </div>
        )}
      </div>

      {/* Text hint */}
      {!isRefreshing && (
        <div className="absolute top-16 text-sm font-medium text-gray-600 dark:text-gray-400">
          {canRefresh ? 'Release to refresh' : 'Pull to refresh'}
        </div>
      )}
    </div>
  );
}
