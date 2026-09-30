import {
  ChevronRightIcon,
  ClockIcon,
  ListChecksIcon,
  ScissorsIcon,
  SmartphoneIcon,
  StoreIcon,
  UserCogIcon,
  UsersRoundIcon,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { requireOwner } from '@/lib/auth/current-account';
import { formatDateTime } from '@/lib/datetime';

export const metadata: Metadata = { title: 'Ajustes' };

const SECTIONS = [
  {
    href: '/configuracoes/barbearia',
    label: 'Barbearia',
    description: 'Nome, endereço, fuso e horário de funcionamento',
    icon: StoreIcon,
  },
  {
    href: '/configuracoes/servicos',
    label: 'Serviços',
    description: 'Preço, duração e adicionais sugeridos',
    icon: ScissorsIcon,
  },
  {
    href: '/configuracoes/barbeiros',
    label: 'Barbeiros',
    description: 'Serviços realizados e jornada semanal',
    icon: UsersRoundIcon,
  },
  {
    href: '/configuracoes/regras',
    label: 'Regras de agendamento',
    description: 'Antecedência, cancelamento, faltas e lembretes',
    icon: ListChecksIcon,
  },
  {
    href: '/configuracoes/whatsapp',
    label: 'Conexão WhatsApp',
    description: 'QR code e status do número da barbearia',
    icon: SmartphoneIcon,
  },
  {
    href: '/configuracoes/usuarios',
    label: 'Usuários',
    description: 'Convidar e remover barbeiros do painel',
    icon: UserCogIcon,
  },
] as const;

export default async function SettingsPage() {
  const { barbershop } = await requireOwner();

  return (
    <section className="flex flex-col gap-6">
      <PageHeader
        title="Ajustes"
        description={
          <span className="inline-flex items-center gap-1">
            <ClockIcon className="size-4" aria-hidden />
            Teste grátis até{' '}
            {formatDateTime(barbershop.trialEndsAt, barbershop.timezone)}
          </span>
        }
      />
      <ul className="flex flex-col divide-y rounded-xl border">
        {SECTIONS.map(({ href, label, description, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-16 items-center gap-3 px-4 py-3 hover:bg-muted/60"
            >
              <Icon
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-medium">{label}</span>
                <span className="truncate text-sm text-muted-foreground">
                  {description}
                </span>
              </span>
              <ChevronRightIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
