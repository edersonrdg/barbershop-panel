import { ChevronLeftIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  backHref?: string;
  action?: ReactNode;
}

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: PageHeaderProps) {
  return (
    <div className="flex items-start gap-2">
      {backHref && (
        <Link
          href={backHref}
          aria-label="Voltar"
          className={cn(
            buttonVariants({ variant: 'ghost', size: 'icon' }),
            '-ml-2 size-11 shrink-0',
          )}
        >
          <ChevronLeftIcon className="size-5" />
        </Link>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1 py-1.5">
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
