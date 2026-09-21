import { Spinner } from '@/components/ui/Spinner';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-10">
      <Spinner size="lg" />
      <p className="mt-3 text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
