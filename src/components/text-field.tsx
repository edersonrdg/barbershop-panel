import type { ComponentProps } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextFieldProps extends Omit<ComponentProps<'input'>, 'id' | 'name'> {
  name: string;
  label: string;
  error?: string;
  hint?: string;
}

export function TextField({
  name,
  label,
  error,
  hint,
  className,
  ...inputProps
}: TextFieldProps) {
  const id = `field-${name}`;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={hint ? `${hintId} ${errorId}` : errorId}
        className={cn('h-11 text-base', className)}
        {...inputProps}
      />
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      <p id={errorId} className="text-sm text-destructive empty:hidden">
        {error}
      </p>
    </div>
  );
}
