import { cn } from '@/lib/utils';

interface FormMessageProps {
  message?: string;
  tone?: 'error' | 'success';
}

// Shows the API message as it came: domain messages are already in Portuguese.
export function FormMessage({ message, tone = 'error' }: FormMessageProps) {
  if (!message) return null;

  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md p-3 text-sm',
        tone === 'error'
          ? 'bg-destructive/10 text-destructive'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
      )}
    >
      {message}
    </p>
  );
}
