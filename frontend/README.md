# Gestão Financeira — Frontend

Interface React + TypeScript para gestão financeira corporativa, integrada à API NestJS do mesmo repositório. A aplicação usa React Router em modo SPA, sessão JWT em cookie HttpOnly, módulos feature-first e uma interface executiva responsiva.

## Decisões técnicas

- **Zustand**: reservado para sessão, filtros de transações e notificações. Dados remotos permanecem nos hooks de cada módulo para evitar uma store global acoplada.
- **Fetch nativo**: centralizado em `src/shared/lib/http/api-client.ts`, com URL por ambiente, `credentials: include`, suporte a `AbortSignal`, tratamento de 204 e erros HTTP tipados.
- **React Hook Form + Zod**: validação declarativa dos formulários sem duplicar estado local.
- **CSS Modules + Tailwind**: Tailwind fornece a base de build; tokens globais e módulos CSS isolam layouts e componentes.
- **SPA mode**: a sessão permanece em cookie HttpOnly e é restaurada com `GET /auth/session`; o JWT nunca é exposto ao JavaScript. O token CSRF retornado pela sessão fica apenas em memória e é enviado automaticamente nas operações mutáveis.

## Estrutura

```text
src/
├── app/providers/
├── layouts/
├── modules/
│   ├── auth/
│   ├── dashboard/
│   ├── categories/
│   └── transactions/
├── routes/
├── shared/
│   ├── components/
│   ├── lib/http/
│   ├── stores/
│   ├── types/
│   └── utils/
├── styles/
└── root.tsx
```

## Ambiente local

```bash
cp .env.example .env
npm install
npm run dev
```

Variável obrigatória:

```env
VITE_API_URL=http://localhost:3000
```

O backend deve liberar a origem do frontend em `CLIENT_ORIGIN` e aceitar credenciais CORS. Todas as chamadas usam cookies; o token não é armazenado no navegador.

## Qualidade

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## Contratos e limitações atuais da API

- Autenticação, categorias e CRUD de transações estão integrados.
- `GET /transactions` ainda retorna um array sem paginação. O frontend envia os parâmetros previstos e aplica um adapter local temporário para filtros e páginas.
- `GET /dashboard/summary` ainda não existe. A tela consome somente esse contrato e mostra indisponibilidade; totais financeiros não são recalculados no navegador.
Os contratos de dashboard e paginação devem ser concluídos no backend para a experiência definitiva de produção.
