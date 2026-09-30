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

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento na porta 5173 |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint com correção automática |
| `npm test` | Testes unitários (Vitest) |
| `npm run api:types` | Regera os tipos da API a partir de `$API_URL/docs-json` |
