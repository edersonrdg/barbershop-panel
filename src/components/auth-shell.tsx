import type { ReactNode } from 'react';

interface AuthShellProps {
  title: string;
  description: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

// Frame of the public pages (login, signup, password and invitation links).
export function AuthShell({
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center gap-8 px-4 pt-[calc(2.5rem+env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
      {footer && (
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center">
          {footer}
        </div>
      )}
    </main>
  );
}
