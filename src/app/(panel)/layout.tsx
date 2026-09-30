import { LogOutIcon } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { requireAccount } from '@/lib/auth/current-account';
import { logout } from './logout-action';
import { PanelNav } from './panel-nav';
import { WhatsAppAlert } from './whatsapp-alert';

export default async function PanelLayout({ children }: LayoutProps<'/'>) {
  const account = await requireAccount();

  return (
    <div className="flex min-h-full flex-1 flex-col md:flex-row">
      <PanelNav role={account.user.role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
          <p className="truncate py-3 font-semibold">
            {account.barbershop.name}
          </p>
          <form action={logout}>
            <Button
              type="submit"
              variant="ghost"
              size="icon"
              className="size-11"
              aria-label="Sair"
            >
              <LogOutIcon />
            </Button>
          </form>
        </header>
        {account.user.role === 'owner' && (
          <Suspense fallback={null}>
            <WhatsAppAlert />
          </Suspense>
        )}
        {/* Bottom padding leaves room for the fixed tab bar on phones. */}
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-6">
          {children}
        </main>
      </div>
    </div>
  );
}
