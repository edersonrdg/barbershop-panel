# BarberBot: painel

Painel web, pensado primeiro para o celular, do BarberBot: um SaaS em que um assistente de IA agenda, remarca e cancela horários pelo WhatsApp da barbearia. Aqui o Dono e os Barbeiros acompanham a agenda, os clientes e as conversas.

A API e o PRD ficam em [barbershop-appointment-agent](https://github.com/edersonrdg/barbershop-appointment-agent).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · shadcn/ui · Zod · openapi-fetch · Vitest

## Como rodar

Pré-requisitos: Node.js 24 e a API rodando localmente (veja o README dela).

```bash
cp .env.example .env.local
npm install
npm run dev
```

O painel abre em http://localhost:5173.

## Como funciona a integração

O navegador nunca fala direto com a API. O servidor do Next funciona como BFF: faz o login, guarda o token num cookie `httpOnly` e chama a API com esse token. Os tipos das rotas são gerados do Swagger da API (`npm run api:types`), então o painel e a API compartilham o mesmo contrato.

## Telas

Protótipo funcional para validar a integração com a API, das histórias US-01 a US-16 do PRD. O visual ainda vai ser refeito.

| Rota | História | Perfil |
| --- | --- | --- |
| `/login`, `/cadastro`, `/esqueci-senha` | US-01 | Público |
| `/redefinir-senha?token=` · `/aceitar-convite?token=` | US-01 · US-02 (links dos e-mails da API) | Público |
| `/agenda` (dia/semana, filtro por barbeiro, atendido/falta, remover bloqueio) | US-08 · US-09 · US-11 | Dono, Barbeiro |
| `/agenda/novo` (serviços → horários livres → cliente) | US-10 | Dono |
| `/agenda/bloqueio` (bloqueio de horário ou folga) | US-09 | Dono |
| `/clientes`, `/clientes/[id]` | US-12 | Dono, Barbeiro |
| `/conversas` (aguardando humano, reativar assistente) | US-16 | Dono |
| `/configuracoes/barbearia` | US-03 | Dono |
| `/configuracoes/servicos` | US-04 | Dono |
| `/configuracoes/barbeiros` | US-05 | Dono |
| `/configuracoes/regras` | US-06 | Dono |
| `/configuracoes/whatsapp` (link do e-mail de queda) | US-13 | Dono |
| `/configuracoes/usuarios` | US-02 | Dono |

Os formulários são Server Actions e funcionam também sem JavaScript.

### Pendências na API

- **Agendamento manual e bloqueio feitos pelo Barbeiro (CA-10.5, CA-09.1).** `POST /appointments` e `POST /blocks` exigem o `barberId`, mas o Barbeiro não tem como descobrir o próprio id (o `GET /me` não devolve esse dado) nem listar os serviços (`GET /settings/services` só aceita o Dono). Por enquanto, os botões "Agendar" e "Bloquear" aparecem só para o Dono. A correção começa na API, por exemplo com o `barberId` no `/me` e uma rota de serviços ativos aberta ao Barbeiro.

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 5173 |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint com correção automática |
| `npm test` | Testes unitários (Vitest) |
| `npm run api:types` | Regera os tipos da API a partir de `$API_URL/docs-json` |
