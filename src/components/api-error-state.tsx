import { CircleAlertIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toApiError } from '@/lib/api/errors';

interface ApiErrorStateProps {
  error: unknown;
  title?: string;
}

// Page-level failure of a GET: shows the API message (e.g. a 403 for a
// profile without access) instead of breaking the whole screen.
export function ApiErrorState({
  error,
  title = 'Não foi possível carregar',
}: ApiErrorStateProps) {
  return (
    <Alert variant="destructive">
      <CircleAlertIcon />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{toApiError(error).message}</AlertDescription>
    </Alert>
  );
}
