import { requireAccount } from '@/lib/auth/current-account';

const ROLE_LABELS = { owner: 'Dono', barber: 'Barbeiro' } as const;

export default async function HomePage() {
  const { user } = await requireAccount();

  return (
    <section className="flex flex-col gap-1">
      <h1 className="text-xl font-semibold">Olá, {user.name}</h1>
      <p className="text-sm text-muted-foreground">
        Você entrou como {ROLE_LABELS[user.role]}.
      </p>
    </section>
  );
}
