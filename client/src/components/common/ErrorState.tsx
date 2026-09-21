import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-red-200 bg-red-50 p-8 text-center">
      <AlertCircle className="mb-3 h-10 w-10 text-red-500" />
      <h3 className="text-lg font-semibold text-red-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary mt-4">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  );
}
