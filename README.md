<h1 align="center">Gestão Financeira</h1>

<p align="center">
  Plataforma para registrar, classificar e acompanhar receitas e despesas com autenticação segura e isolamento dos dados por usuário.
</p>

<p align="center">
  <img src=".github/summary.png" alt="Dashboard da aplicação Gestão Financeira">
</p>

## Deploy público

- **Frontend:** https://frontend-gestao-financeira.vercel.app
- **Backend:** https://backend-gestao-financeira.vercel.app

O monorepo é publicado como dois projetos independentes na Vercel:

| Projeto | Root Directory | Variáveis principais |
| --- | --- | --- |
| Frontend | `frontend` | `VITE_API_URL` |
| Backend | `backend` | `NODE_ENV`, `CLIENT_ORIGIN`, `DATABASE_URL` e `JWT_SECRET` |

Para o cookie de autenticação `SameSite=Lax` funcionar com segurança em produção, prefira domínios próprios pertencentes ao mesmo site, por exemplo `app.exemplo.com` e `api.exemplo.com`. Se forem usados domínios cross-site distintos, será necessário revisar a política `SameSite` e implementar proteção CSRF.

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
| Deploy | Vercel |

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

Em produção, configure essas variáveis nos projetos da Vercel. `CLIENT_ORIGIN` deve conter a URL pública exata do frontend, e `VITE_API_URL` deve apontar para a API pública.

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

```bash
cd backend
npm test
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
