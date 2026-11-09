<h1 align="center">Gestão Financeira</h1>

<p align="center">
  Plataforma para registrar, classificar e acompanhar receitas e despesas com autenticação segura e isolamento dos dados por usuário.
</p>

<p align="center">
  <img src=".github/summary.png" alt="Dashboard da aplicação Gestão Financeira">
</p>

## Deploy público

- **Frontend:** https://frontend-amber-beta-17.vercel.app
- **Backend:** https://gestao-financeira-8p7c.onrender.com

O monorepo é publicado como dois serviços independentes:

| Serviço | Plataforma | Root Directory | Build | Inicialização |
| --- | --- | --- | --- | --- |
| Frontend | Vercel | `frontend` | `npm run build` | SPA estática |
| Backend | Render Web Service | `backend` | `npm ci --include=dev && npm run build` | `npm run start:prod` |

Como frontend e backend podem estar em sites distintos (por exemplo, Vercel e Render), o cookie de produção utiliza `SameSite=None; Secure`. As operações mutáveis exigem também um token CSRF enviado no header `X-CSRF-Token`. Navegadores que bloqueiam cookies de terceiros ainda podem exigir domínios próprios no mesmo site ou um proxy same-origin.

## Funcionalidades

- Cadastro, login e restauração de sessão com JWT em cookie `HttpOnly`.
- Categorias próprias por usuário.
- CRUD de transações de entrada e saída.
- Filtros por tipo, categoria e período.
- Dashboard com saldo, entradas, saídas e principais categorias de despesas.
- Interface responsiva com estados de carregamento, erro e ausência de dados.

## Stack

| Camada | Tecnologias |
| --- | --- |
| Frontend | React 19, React Router, TypeScript, Vite, Zustand, Tailwind CSS, CSS Modules, React Hook Form e Zod |
| Backend | NestJS 12, TypeScript, JWT, Argon2, class-validator e class-transform |
| Dados | PostgreSQL e Prisma ORM 8 |
| Qualidade | Vitest, Testing Library, ESLint e Oxlint |
| Deploy | Vercel no frontend e Render no backend |

## Decisões técnicas

- O JWT permanece em cookie `HttpOnly`; não é salvo em `localStorage` nem exposto ao JavaScript.
- O frontend restaura a sessão com `GET /auth/session`.
- Zustand é usado apenas para sessão, filtros compartilhados e feedback da interface.
- Valores monetários trafegam como strings decimais para evitar perda de precisão.
- O backend sempre filtra categorias, transações e indicadores pelo usuário autenticado.
- O repositório é organizado como dois projetos independentes (`frontend` e `backend`), cada um com seu próprio lockfile.

## Pré-requisitos

- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) 22 ou superior
- npm 10 ou superior
- [Docker](https://www.docker.com/) com Docker Compose v2, **ou** uma instância PostgreSQL 15+ acessível

> O ambiente local do projeto utiliza a imagem `postgres:18`.

## Instalação

Clone o repositório e instale as dependências de cada aplicação usando os lockfiles versionados:

```bash
git clone https://github.com/dygocode/gestao-financeira.git
cd gestao-financeira

cd backend
npm ci
cd ../frontend
npm ci
cd ..
```

## Variáveis de ambiente

### Backend

Crie `backend/.env.development` a partir do exemplo:

```bash
cp backend/.env.example backend/.env.development
```

```env
NODE_ENV=development
PORT=3100
JWT_SECRET="troque-por-uma-chave-longa-e-aleatoria"
CLIENT_ORIGIN="http://localhost:5173"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestao_financeira"
SEED_ADMIN_PASSWORD="Demo@123"
```

### Frontend

Crie `frontend/.env` a partir do exemplo:

```bash
cp frontend/.env.example frontend/.env
```

```env
VITE_API_URL=http://localhost:3100
```

### Produção — frontend na Vercel

Configure em **Vercel → Project Settings → Environment Variables**:

```env
VITE_API_URL=https://gestao-financeira-8p7c.onrender.com
```

Configuração do projeto:

```text
Root Directory: frontend
Build Command: npm run build
```

Depois de alterar `VITE_API_URL`, faça um novo deploy: variáveis `VITE_*` são incorporadas ao bundle durante o build.

### Produção — backend no Render

Configure em **Render → Web Service → Environment**:

```env
NODE_ENV=production
CLIENT_ORIGIN=https://frontend-amber-beta-17.vercel.app
DATABASE_URL=postgresql://usuario:senha@host:5432/banco
JWT_SECRET=uma-chave-longa-forte-e-aleatoria
SEED_ADMIN_PASSWORD=uma-senha-segura-para-o-usuario-demo
```

Configuração do Web Service:

```text
Root Directory: backend
Runtime: Node
Node Version: 22 ou superior
Build Command: npm ci --include=dev && npm run build
Start Command: npm run start:prod
```

`CLIENT_ORIGIN` deve conter somente a origem (`https://frontend-amber-beta-17.vercel.app`), sem `/dashboard` e sem barra final. `PORT` não precisa ser configurada no Render, pois a plataforma a fornece automaticamente.

O `--include=dev` no build instala o Nest CLI e o TypeScript mesmo com `NODE_ENV=production`. Em runtime, `NODE_ENV=production` ativa o cookie `SameSite=None; Secure`, necessário para a comunicação entre Vercel e Render.

## Banco de dados local

Na raiz do repositório, inicie o PostgreSQL:

```bash
docker compose -f backend/infra/docker-compose.yml up -d
```

Para encerrar o container sem apagar os dados:

```bash
docker compose -f backend/infra/docker-compose.yml down
```

## Migrations

Com o PostgreSQL ativo e `backend/.env.development` configurado:

```bash
cd backend

# Conferir migrations pendentes
npm run migrate:status

# Aplicar migrations existentes
npm run migrate

# Validar a integridade do grafo de migrations
npm run migrate:check
```

Os comandos utilizam o contrato e o diretório de migrations definidos em `backend/prisma.config.ts`. Para regenerar os artefatos TypeScript após alterar o contrato Prisma:

```bash
npm run contract:emit
```

## Usuário de demonstração

Após aplicar as migrations, execute o seed idempotente:

```bash
cd backend
npm run seed
```

Credenciais padrão do script `backend/src/prisma/seed.ts`:

```text
Nome: demo
E-mail: demo@fintech.com
Senha: Demo@123
```

O valor da senha pode ser substituído pela variável `SEED_ADMIN_PASSWORD`. Reexecutar o seed não duplica o usuário.

## Como iniciar em desenvolvimento

Use dois terminais após iniciar o PostgreSQL e aplicar as migrations.

### Terminal 1 — backend

```bash
cd backend
npm run start:dev
```

API disponível em `http://localhost:3100`.

### Terminal 2 — frontend

```bash
cd frontend
npm run dev
```

Interface disponível em `http://localhost:5173`.

## Qualidade e build

### Backend

O backend possui 17 testes unitários distribuídos em oito arquivos de spec:

| Área | Cenários cobertos |
| --- | --- |
| Aplicação | Resposta básica do `AppController` |
| Login e JWT | Validação de e-mail e senha, rejeição de senha incorreta, normalização do e-mail e expiração do token de acesso |
| Proteção CSRF | Métodos seguros, mutação com token válido e bloqueio de token ausente ou incorreto |
| Categorias | Criação, atualização e exclusão com filtro pelo proprietário |
| Transações | Criação vinculada à categoria do usuário, validação dos campos e exclusão pelo proprietário |
| Controllers | Inicialização dos controllers com serviços e guards substituídos por mocks |

Os testes usam Vitest, mocks do Prisma e, no caso da autenticação, JWT e Argon2 reais em memória. Nenhum teste unitário depende do PostgreSQL.

Para executá-los:

```bash
cd backend

# Executar todos os testes unitários uma vez
npm test

# Reexecutar automaticamente durante alterações
npm run test:watch

# Gerar relatório de cobertura
npm run test:cov

# Executar somente um arquivo de teste
npm test -- src/auth/auth.service.spec.ts

# Testes end-to-end, executados separadamente
npm run test:e2e
```

Validações adicionais do backend:

```bash
cd backend
npm run lint
npm run build
```

### Frontend

```bash
cd frontend
npm test
npm run lint
npm run typecheck
npm run build
```
