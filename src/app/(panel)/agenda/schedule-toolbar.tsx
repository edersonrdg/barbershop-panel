import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { formatDayHeading, formatShortDate } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import {
  scheduleHref,
  shiftDate,
  type ScheduleQuery,
  type ScheduleView,
} from './schedule';

interface ScheduleToolbarProps {
  query: ScheduleQuery;
  today: string;
  // Period the API actually answered (Monday to Sunday in the week view).
  startDate: string;
  endDate: string;
}

const VIEWS: { view: ScheduleView; label: string }[] = [
  { view: 'day', label: 'Dia' },
  { view: 'week', label: 'Semana' },
];

export function ScheduleToolbar({
  query,
  today,
  startDate,
  endDate,
}: ScheduleToolbarProps) {
  const periodLabel =
    query.view === 'day'
      ? formatDayHeading(startDate)
      : `${formatShortDate(startDate)} a ${formatShortDate(endDate)}`;
  const iconButton = cn(
    buttonVariants({ variant: 'outline', size: 'icon' }),
    'size-11 shrink-0',
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        role="group"
        aria-label="Visão da agenda"
        className="grid grid-cols-2 rounded-lg bg-muted p-1"
      >
        {VIEWS.map(({ view, label }) => (
          <Link
            key={view}
            href={scheduleHref({ ...query, view })}
            aria-current={query.view === view ? 'page' : undefined}
            className={cn(
              'flex h-10 items-center justify-center rounded-md text-sm font-medium text-muted-foreground',
              query.view === view && 'bg-background text-foreground shadow-sm',
            )}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Link
          href={scheduleHref({ ...query, date: shiftDate(query, -1) })}
          aria-label={query.view === 'day' ? 'Dia anterior' : 'Semana anterior'}
          className={iconButton}
        >
          <ChevronLeftIcon />
        </Link>
        <p className="min-w-0 flex-1 text-center font-medium first-letter:uppercase">
          {periodLabel}
        </p>
        <Link
          href={scheduleHref({ ...query, date: shiftDate(query, 1) })}
          aria-label={query.view === 'day' ? 'Próximo dia' : 'Próxima semana'}
          className={iconButton}
        >
          <ChevronRightIcon />
        </Link>
      </div>
      {query.date !== today && (
        <Link
          href={scheduleHref({ ...query, date: today })}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            'h-11 self-center',
          )}
        >
          Voltar para hoje
        </Link>
      )}
    </div>
  );
}
