'use client';

import {
  useActionState,
  useEffect,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { SubmitButton } from '@/components/submit-button';
import type { FormState } from '@/lib/forms';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends Pick<
  ComponentProps<typeof SubmitButton>,
  'variant' | 'size'
> {
  action: (previous: FormState, formData: FormData) => Promise<FormState>;
  fields: Record<string, string>;
  children: ReactNode;
  pendingLabel?: string;
  confirmMessage?: string;
  className?: string;
}

// One-click mutation (activate, remove, resume...) as a tiny form, so it also
// works before hydration. An error shows right under the button; a success
// goes to a toast, because the revalidated page often removes the button.
export function ActionButton({
  action,
  fields,
  children,
  pendingLabel,
  confirmMessage,
  className,
  variant = 'outline',
  size,
}: ActionButtonProps) {
  const [state, formAction] = useActionState(action, {});

  useEffect(() => {
    if (state.success) toast.success(state.success);
  }, [state]);

  function confirmFirst(event: FormEvent<HTMLFormElement>) {
    if (confirmMessage && !window.confirm(confirmMessage)) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={confirmFirst}
      className={cn('flex flex-col gap-1', className)}
    >
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <SubmitButton
        variant={variant}
        size={size}
        pendingLabel={pendingLabel}
        className="h-11 text-sm"
      >
        {children}
      </SubmitButton>
      {state.message && (
        <p role="alert" className="text-sm text-destructive">
          {state.message}
        </p>
      )}
    </form>
  );
}
