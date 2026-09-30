'use client';

import {
  CalendarDaysIcon,
  MessageCircleIcon,
  SettingsIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  ownerOnly?: boolean;
}

// Hiding owner-only sections from a barber is interface comfort; the API
// answers 403 on those routes anyway (section 5 of the PRD).
const NAV_ITEMS: NavItem[] = [
  { href: '/agenda', label: 'Agenda', icon: CalendarDaysIcon },
  { href: '/clientes', label: 'Clientes', icon: UsersIcon },
  {
    href: '/conversas',
    label: 'Conversas',
    icon: MessageCircleIcon,
    ownerOnly: true,
  },
  {
    href: '/configuracoes',
    label: 'Ajustes',
    icon: SettingsIcon,
    ownerOnly: true,
  },
];

export function PanelNav({ role }: { role: 'owner' | 'barber' }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || role === 'owner');

  return (
    <nav
      aria-label="Seções do painel"
      className="fixed inset-x-0 bottom-0 z-20 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:sticky md:top-0 md:h-dvh md:w-56 md:shrink-0 md:border-t-0 md:border-r md:pt-[calc(1rem+env(safe-area-inset-top))] md:pb-4"
    >
      <ul className="flex md:flex-col md:gap-1 md:px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href} className="flex-1 md:flex-none">
              <Link
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium text-muted-foreground transition-colors md:min-h-11 md:flex-row md:justify-start md:gap-3 md:rounded-lg md:px-3 md:text-sm',
                  active
                    ? 'text-foreground md:bg-muted'
                    : 'hover:text-foreground md:hover:bg-muted/60',
                )}
              >
                <Icon className="size-5" aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
