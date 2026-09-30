import { Badge } from '@/components/ui/badge';

const STATUS = {
  confirmed: { label: 'Confirmado', variant: 'secondary' },
  attended: { label: 'Atendido', variant: 'default' },
  no_show: { label: 'Faltou', variant: 'destructive' },
} as const;

const ORIGIN = { bot: 'WhatsApp', manual: 'Manual' } as const;

interface AppointmentBadgesProps {
  status: keyof typeof STATUS;
  origin: keyof typeof ORIGIN;
}

// Status and origin of an appointment (CA-08.3, RF-28), used in the schedule
// and in the client profile.
export function AppointmentBadges({ status, origin }: AppointmentBadgesProps) {
  return (
    <span className="flex flex-wrap gap-1.5">
      <Badge variant={STATUS[status].variant}>{STATUS[status].label}</Badge>
      <Badge variant="outline">{ORIGIN[origin]}</Badge>
    </span>
  );
}
