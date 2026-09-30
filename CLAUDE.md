# CLAUDE.md

Painel web do BarberBot, para Dono e Barbeiros gerenciarem agenda, clientes, conversas do WhatsApp e configurações da barbearia. Consome a API do repositório irmão [barbershop-appointment-agent](../barbershop-appointment-agent).

**Fonte única de verdade: o PRD da API, em `../barbershop-appointment-agent/docs/PRD.md`.** Este repositório não tem PRD próprio. Antes de implementar uma tela, leia a história (seção 11) e a seção 5 (perfis e permissões). Para enxergar o código da API, abra a sessão com `claude --add-dir ../barbershop-appointment-agent`.

Este repositório é **público** e funciona como vitrine acadêmica. Nunca versione segredos, dados reais de clientes ou `.env*` (só o `.env.example`).

## Stack

- Node.js v24 + TypeScript (strict)
- Next.js 16 (App Router, Server Components, Server Actions). No Next 16, o antigo `middleware.ts` se chama `proxy.ts`. Em dúvida sobre alguma API, consulte a documentação instalada em `node_modules/next/dist/docs/`, que corresponde à versão usada aqui.
- Tailwind CSS v4 + shadcn/ui (estilo `base-nova`, sobre Base UI). Os componentes ficam em `src/components/ui/` e são adicionados com `npx shadcn@latest add <nome>`.
- Zod para validar formulários e dados vindos de fora
- `openapi-fetch` + `openapi-typescript` para um cliente da API tipado pelo Swagger
- Vitest para testes unitários
- ESLint (`eslint-config-next`) + Prettier (`singleQuote`, `trailingComma: all`, ordenação de classes do Tailwind)

## Comandos

```bash
cp .env.example .env.local    # primeira vez
npm run dev                   # painel em http://localhost:5173 (a API precisa estar no ar em API_URL)

npm run build        # build de produção (também checa tipos)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint com --fix
npm run lint:check   # eslint sem corrigir
npm run format       # prettier em src/
npm test             # vitest (*.test.ts em src/)
npm run api:types    # regera src/lib/api/schema.d.ts a partir de $API_URL/docs-json
```

A porta 5173 é a mesma do `APP_WEB_URL` da API, que monta os links de e-mail (ex.: `/aceitar-convite?token=...`). As rotas do painel precisam bater com esses links.

Antes de considerar uma task concluída, rode `npm run lint`, `npm run build` e `npm test` e confirme que passam.

## Fluxo de trabalho

Segue o mesmo fluxo da API (ver o `CLAUDE.md` dela):

- As telas implementam histórias do PRD, na ordem da seção 12, e só usam rotas que a API já expõe. Se faltar uma rota, pare e avise: a mudança começa na API.
- Não implemente comportamento que não esteja em `RF`/`RN`/`CA`.
- **Commits:** Conventional Commits citando a história, ex.: `feat(US-07): add schedule screen`.
- **Branches:** uma por história, a partir da `main` atualizada (ex.: `feat/us-07-schedule-screen`).
- **Pull Request:** push só da branch da história (nunca na `main`, nunca com `--force`) e `gh pr create --base main`, com descrição em português (resumo, o que foi feito, rastreabilidade, como testar, pendências).

## Arquitetura

```
src/
├── proxy.ts                 # Redireciona quem não tem cookie de sessão (checagem otimista)
├── app/                     # Rotas (App Router)
│   ├── login/               # Página pública + Server Action de login
│   ├── session-expired/     # Limpa o cookie de um token vencido e volta ao login
│   └── (panel)/             # Área logada: layout com requireAccount() e as telas
├── components/
│   └── ui/                  # Componentes do shadcn/ui (gerados; edite com parcimônia)
└── lib/
    ├── env.ts               # Variáveis de ambiente do servidor, validadas com Zod
    ├── api/                 # Cliente da API, tipos gerados e tratamento de erros
    └── auth/                # Cookie de sessão e conta atual
```

- Componentes específicos de uma tela ficam na pasta da rota (ex.: `app/login/login-form.tsx`). Só vão para `src/components/` quando forem usados por mais de uma tela.
- Arquivos em kebab-case; um componente exportado por arquivo.

## Integração com a API (BFF)

O navegador **nunca** chama a API direto. Toda chamada sai do servidor do Next (Server Components, Server Actions ou Route Handlers), que funciona como BFF (*backend for frontend*).

- **Cliente:** use `createApiClient(token)` de [src/lib/api/client.ts](src/lib/api/client.ts). Ele é tipado pelo contrato da API: caminho, body, params e resposta vêm de `schema.d.ts`.
- **Tipos:** `src/lib/api/schema.d.ts` é gerado (`npm run api:types`) e versionado, para o build não depender da API no ar. Nunca edite esse arquivo à mão. Para o tipo de uma resposta, use `ApiResponse<'/rota', 'get'>` de [types.ts](src/lib/api/types.ts). Não crie interfaces paralelas ao contrato.
- **Quando a API mudar** (rota nova ou payload alterado), rode `npm run api:types` com a API local no ar e versione o `schema.d.ts` junto com a tela que usa a mudança.
- **Erros:** a API devolve `{ message, errors?: [{ field, message }] }`, com mensagens já em português. Converta com `toApiError()` e mostre a `message` ao usuário. Não reescreva as mensagens de domínio.
- **Regras de negócio ficam na API.** O painel nunca calcula disponibilidade, conflitos de horário, bloqueios ou permissões por conta própria. Ele exibe o que a API devolve e envia o que o usuário escolheu.

## Segurança

- **Token só em cookie `httpOnly`** (`secure` em produção, `sameSite: lax`), gravado por [session-cookie.ts](src/lib/auth/session-cookie.ts). Nunca guarde o token em `localStorage`, estado de React, URL ou em props de Client Components.
- **Verificação em duas camadas:** o `proxy.ts` só olha se o cookie existe, para ser rápido. A verificação de verdade é o `requireAccount()`, que chama `GET /me`. Toda página ou Server Action da área logada chama `requireAccount()` (a chamada é deduplicada por requisição com `cache`).
- **Permissões por perfil:** esconder um botão do Barbeiro é só conforto de interface. Quem barra é a API, que responde 403. Trate o 403 mostrando a mensagem; nunca confie só no esconder.
- **Server Actions são endpoints públicos:** valide a entrada com Zod dentro de cada action, sem confiar no formulário. Nunca receba `barbershopId` ou perfil do cliente, porque o tenant vem do token (RN-26).
- **Código só de servidor** (`env.ts`, cliente da API, cookies) importa `'server-only'`, para que o build quebre se ele vazar para o navegador. Variáveis `NEXT_PUBLIC_*` vão para o navegador, então nunca coloque segredo nelas.
- Nunca use `dangerouslySetInnerHTML` com dados da API (nomes de clientes, mensagens do WhatsApp).
- **LGPD:** não logue telefone, conteúdo de conversa nem token. Nada de `console.log` com dados de clientes.
- Os cabeçalhos de segurança (`X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy`) ficam em [next.config.ts](next.config.ts).

## Mobile first

O painel é usado principalmente pelo celular, no balcão ou entre um atendimento e outro. **Desenhe primeiro para uma tela de 360px** e só depois amplie com `sm:`/`md:`/`lg:`. O desktop é adaptação, nunca o contrário.

- **Classes base = celular.** Escreva o layout sem prefixo para o celular e use os prefixos só para telas maiores (ex.: `flex-col md:flex-row`). Nunca faça o inverso (`max-md:`) como padrão.
- **Uma coluna.** Listas em cartões empilhados em vez de tabelas largas; tabela só a partir de `md:`, se fizer sentido.
- **Alvos de toque de pelo menos 44px** (`h-11`/`size-11`; botões principais `h-12`). Ações principais ao alcance do polegar (fim da tela ou barra fixa inferior).
- **Inputs com `text-base` (16px)**, senão o iOS dá zoom ao focar. Use `type`, `inputMode` e `autoComplete` certos (`tel`, `email`, `numeric`) para abrir o teclado adequado.
- **Navegação:** quando houver mais de uma seção na área logada, use uma barra inferior fixa com ícone e rótulo (Agenda, Clientes, Conversas, Ajustes) no celular, que vira menu lateral a partir de `md:`.
- **Áreas seguras:** respeite `env(safe-area-inset-*)` em cabeçalhos e barras fixas (notch e barra de gestos).
- **Nada de rolagem horizontal** na página. Conteúdo largo (ex.: grade da agenda) rola dentro do próprio contêiner.
- Teste no modo responsivo do navegador (360×800) antes de dar a tela como pronta.

## Performance

- **Server Components por padrão.** Busque dados no servidor e passe só o necessário para o cliente. `'use client'` apenas em componentes com estado, eventos ou hooks do navegador, e o mais "para baixo" possível na árvore.
- **Formulários com Server Actions + `useActionState`.** Funcionam até sem JavaScript e dispensam libs de formulário e de fetch no cliente. Não adicione React Query, Redux, axios ou similares sem necessidade real.
- Chamadas independentes em paralelo (`Promise.all`), nunca em sequência.
- Use `loading.tsx` e `<Suspense>` para mostrar esqueleto enquanto os dados chegam; no celular a rede é lenta.
- `next/image` para imagens e `next/font` para fontes. Ícones do `lucide-react`, importados um a um.
- Após uma mutação, atualize a tela com `revalidatePath`/`redirect` na Server Action, sem recarregar a página inteira.

## Convenções de código

- **Idioma:** código em inglês; textos para o usuário em português do Brasil.
- **Datas:** a API manda UTC (ISO 8601). Converta para o fuso da barbearia (`barbershop.timezone`, padrão `America/Sao_Paulo`) só na exibição, com `Intl.DateTimeFormat('pt-BR', { timeZone })`. Ao enviar, mande o que a API pede.
- **Dinheiro:** a API trabalha em centavos (inteiro). Converta só para exibir (`Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`) e converta de volta para centavos ao enviar. Nunca faça conta com float.
- **Tipagem estrita:** nunca use `any`. Use `unknown` e estreite, ou os tipos do contrato da API.
- **Acessibilidade:** todo input tem `<Label>`; erros de campo ligados por `aria-describedby` e `aria-invalid`; botões só com ícone têm `aria-label`.
- **Early returns** em vez de `if`s aninhados. Comente só o *porquê*, nunca o *o quê*.

## Testes

- Funções puras de `lib/` (conversão de datas, dinheiro, erros) ganham teste no Vitest, ao lado do arquivo (`*.test.ts`).
- Critérios de aceite de telas (`CA-xx.y`) viram teste citando o `CA` no nome quando a lógica estiver no painel. Nenhum teste chama a API real.
