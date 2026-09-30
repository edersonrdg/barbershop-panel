import type { ComponentProps } from 'react';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/native-select';

interface SelectFieldProps extends Omit<
  ComponentProps<typeof NativeSelect>,
  'id' | 'name'
> {
  name: string;
  label: string;
  error?: string;
}

// Native select: the phone opens its own picker, and it works without JS.
export function SelectField({
  name,
  label,
  error,
  children,
  ...selectProps
}: SelectFieldProps) {
  const id = `field-${name}`;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <NativeSelect
        id={id}
        name={name}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className="w-full"
        {...selectProps}
      >
        {children}
      </NativeSelect>
      <p id={errorId} className="text-sm text-destructive empty:hidden">
        {error}
      </p>
    </div>
  );
}
