import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CheckboxFieldProps extends Omit<
  ComponentProps<'input'>,
  'type' | 'children'
> {
  label: ReactNode;
  description?: ReactNode;
}

// Native checkbox inside a 44px row, so the whole row is the touch target.
export function CheckboxField({
  label,
  description,
  className,
  ...inputProps
}: CheckboxFieldProps) {
  return (
    <label
      className={cn(
        'flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-1 py-2 has-disabled:cursor-not-allowed has-disabled:opacity-50',
        className,
      )}
    >
      <input
        type="checkbox"
        className="size-5 shrink-0 accent-primary"
        {...inputProps}
      />
      <span className="flex flex-col">
        <span className="text-base">{label}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </span>
    </label>
  );
}
