import { BanIcon } from 'lucide-react';
import { ActionButton } from '@/components/action-button';
import { formatTime } from '@/lib/datetime';
import { removeBlock } from './actions';
import type { Block } from './schedule';

interface BlockCardProps {
  block: Block;
  timeZone: string;
  showBarber: boolean;
}

export function BlockCard({ block, timeZone, showBarber }: BlockCardProps) {
  const title =
    block.kind === 'day_off'
      ? 'Folga o dia inteiro'
      : `Bloqueado ${formatTime(block.startsAt, timeZone)} – ${formatTime(block.endsAt, timeZone)}`;

  return (
    <article className="flex items-center gap-3 rounded-xl border border-dashed bg-muted/40 p-3">
      <BanIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-sm font-medium">{title}</p>
        <p className="truncate text-sm text-muted-foreground">
          {[showBarber && block.barber.name, block.reason]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
      <ActionButton
        action={removeBlock}
        fields={{ blockId: block.id }}
        variant="ghost"
        pendingLabel="Removendo…"
        confirmMessage="Remover este bloqueio? Os horários voltam a ser oferecidos."
      >
        Remover
      </ActionButton>
    </article>
  );
}
