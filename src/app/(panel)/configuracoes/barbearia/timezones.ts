import type { paths } from '@/lib/api/schema';

type Timezone =
  paths['/settings/barbershop']['put']['requestBody']['content']['application/json']['timezone'];

// Runtime list of the timezones the API accepts. `satisfies` breaks the build
// if the contract gains or loses a value that this list does not follow.
export const TIMEZONES = [
  'America/Noronha',
  'America/Belem',
  'America/Fortaleza',
  'America/Recife',
  'America/Araguaina',
  'America/Maceio',
  'America/Bahia',
  'America/Sao_Paulo',
  'America/Campo_Grande',
  'America/Cuiaba',
  'America/Santarem',
  'America/Porto_Velho',
  'America/Boa_Vista',
  'America/Manaus',
  'America/Eirunepe',
  'America/Rio_Branco',
] as const satisfies readonly Timezone[];

type MissingTimezone = Exclude<Timezone, (typeof TIMEZONES)[number]>;
const everyTimezoneListed: MissingTimezone extends never ? true : false = true;
void everyTimezoneListed;

export function timezoneLabel(timezone: string): string {
  return timezone.replace('America/', '').replaceAll('_', ' ');
}
