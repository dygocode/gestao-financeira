# Gestão Financeira — API

API REST construída com NestJS para autenticação, categorias, transações financeiras e indicadores consolidados. Os dados de negócio são isolados pelo usuário autenticado e persistidos em PostgreSQL por meio do Prisma ORM 8.

## Tecnologias

- Node.js 22+ e TypeScript strict
- NestJS 12 com Express
- PostgreSQL 15+
- Prisma ORM 8
- JWT em cookie `HttpOnly`
- Argon2 para hash de senhas
- class-validator e class-transformer
- Vitest, Supertest, Oxlint e Prettier

## Arquitetura

```text
src/
├── auth/          # cadastro, login, logout, sessão e AuthGuard
├── category/      # CRUD de categorias por usuário
├── dashboard/     # indicadores financeiros consolidados
├── prisma/        # provider Nest, cliente e contrato gerado
├── transaction/   # CRUD de entradas e saídas
├── user/          # acesso aos usuários
├── app.module.ts
└── main.ts

prisma/
├── contract.prisma
└── migrations/
```

O fluxo principal segue `Controller → Service → Prisma`. Categorias, transações e dashboard sempre usam o `sub` do JWT como `userId`; IDs enviados pelo cliente não definem o proprietário dos dados.

## Pré-requisitos

- Node.js 22 ou superior
- npm 10 ou superior
- Docker com Docker Compose v2, **ou** PostgreSQL 15+ disponível

O ambiente Docker do projeto utiliza PostgreSQL 18.

## Instalação

Na pasta `backend`:

```bash
npm ci
cp .env.example .env.development
```

`npm ci` instala exatamente as versões registradas no `package-lock.json` e recria o diretório `node_modules`.

## Variáveis de ambiente

Exemplo para desenvolvimento local:

```env
NODE_ENV=development
PORT=3100
JWT_SECRET="troque-por-uma-chave-longa-e-aleatoria"
CLIENT_ORIGIN="http://localhost:5173"
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gestao_financeira"
SEED_ADMIN_PASSWORD="Demo@123"
```

| Variável | Obrigatória | Finalidade |
| --- | --- | --- |
| `NODE_ENV` | Não | Define comportamento de desenvolvimento/produção e cookie `Secure` |
| `PORT` | Não | Porta local da API; padrão do projeto: `3100` |
| `JWT_SECRET` | Sim | Assinatura dos JWTs HS256 |
| `CLIENT_ORIGIN` | Sim | Origem exata permitida pelo CORS |
| `DATABASE_URL` | Sim | Conexão PostgreSQL usada pela aplicação, migrations e seed |
| `SEED_ADMIN_PASSWORD` | Não | Substitui a senha padrão do usuário demo |

Nunca versione arquivos `.env` reais nem reutilize o segredo de exemplo em produção.

## PostgreSQL local

Dentro de `backend`:

```bash
docker compose -f infra/docker-compose.yml up -d
```

Para encerrar sem remover o volume:

```bash
docker compose -f infra/docker-compose.yml down
```

## Prisma e migrations

O Prisma lê `prisma.config.ts`, o contrato em `prisma/contract.prisma` e as migrations em `prisma/migrations`.

```bash
# Mostrar migrations aplicadas e pendentes
npm run migrate:status

# Aplicar migrations pendentes
npm run migrate

# Verificar a integridade do grafo de migrations
npm run migrate:check

# Regenerar contract.json e contract.d.ts após alterar o contrato
npm run contract:emit
```

Ordem recomendada para um banco novo:

```bash
docker compose -f infra/docker-compose.yml up -d
npm run migrate
npm run seed
```

## Seed de demonstração

O seed é idempotente: cria o usuário quando ausente e atualiza nome ou senha quando necessário.

```bash
npm run seed
```

Credenciais padrão:

```text
Nome: demo
E-mail: demo@fintech.com
Senha: Demo@123
```

Defina `SEED_ADMIN_PASSWORD` para substituir a senha sem editar o script. Não execute o seed automaticamente em cada deploy de produção.

## Executar a API

```bash
# Desenvolvimento com watch
npm run start:dev

# Build de produção
npm run build
npm run start:prod
```

Por padrão, a API local fica disponível em `http://localhost:3100`.

## Autenticação e sessão

Login e cadastro enviam o JWT no cookie `access_token` com:

- `HttpOnly`
- `SameSite=Lax`
- `Secure` quando `NODE_ENV=production`
- validade de 900 segundos
- `Path=/`

O token não é devolvido no JSON. O cliente deve enviar cookies nas requisições, por exemplo com `credentials: "include"`.

```text
POST /auth/login
Content-Type: application/json

{
  "email": "demo@fintech.com",
  "password": "Demo@123"
}
```

Resposta:

```json
{
  "user": {
    "id": 1,
    "email": "demo@fintech.com",
    "name": "demo"
  },
  "expiresIn": 900
}
```

`GET /auth/session` restaura o usuário a partir do cookie e retorna a validade restante do JWT.

## Endpoints

Rotas marcadas como protegidas exigem o cookie `access_token`.

| Método | Endpoint | Acesso | Descrição |
| --- | --- | --- | --- |
| `GET` | `/` | Público | Verificação básica da API |
| `POST` | `/auth/register` | Público | Criar usuário e iniciar sessão |
| `POST` | `/auth/login` | Público | Autenticar e iniciar sessão |
| `POST` | `/auth/logout` | Público | Limpar o cookie de sessão |
| `GET` | `/auth/session` | Protegido | Restaurar usuário e validade restante |
| `GET` | `/categories` | Protegido | Listar categorias próprias |
| `POST` | `/categories` | Protegido | Criar categoria |
| `GET` | `/categories/:id` | Protegido | Consultar categoria própria |
| `PATCH` | `/categories/:id` | Protegido | Atualizar categoria própria |
| `DELETE` | `/categories/:id` | Protegido | Excluir categoria própria |
| `GET` | `/transactions` | Protegido | Listar transações próprias |
| `POST` | `/transactions` | Protegido | Criar transação |
| `GET` | `/transactions/:id` | Protegido | Consultar transação própria |
| `PATCH` | `/transactions/:id` | Protegido | Atualizar transação própria |
| `DELETE` | `/transactions/:id` | Protegido | Excluir transação própria |
| `GET` | `/dashboard/summary` | Protegido | Saldo, entradas, saídas e top 3 categorias de despesas |
| `GET` | `/users/:id` | Público/legado | Consultar usuário por ID |

> A rota `/users/:id` não participa do fluxo principal de sessão e deve ser revisada antes de expor dados de usuários em um ambiente público.

## Contratos principais

### Criar categoria

```json
{
  "name": "Infraestrutura",
  "description": "Cloud, servidores e licenças"
}
```

### Criar transação

```json
{
  "name": "Servidor de produção",
  "description": "Competência novembro",
  "amount": "149.90",
  "categoryId": 1,
  "date": "2026-11-09T12:00:00.000Z",
  "type": "EXPENSE"
}
```

`type` aceita `INCOME` ou `EXPENSE`. Valores monetários são strings decimais para preservar precisão.

### Dashboard summary

```json
{
  "balance": "2350.10",
  "totalIncome": "5000.00",
  "totalExpenses": "2649.90",
  "topExpenseCategories": [
    {
      "categoryId": 1,
      "categoryName": "Infraestrutura",
      "total": "1499.90"
    }
  ]
}
```

## Testes e qualidade

```bash
# Testes unitários
npm test

# Testes em modo watch
npm run test:watch

# Cobertura
npm run test:cov

# Testes end-to-end
npm run test:e2e

# Análise estática
npm run lint

# Formatação
npm run format

# Build
npm run build
```

Os testes unitários cobrem autenticação, expiração do JWT, categorias, transações e validações de DTOs.

## Deploy na Vercel

Crie um projeto Vercel específico para a API:

```text
Root Directory: backend
Framework Preset: NestJS
Install Command: npm ci
Build Command: npm run build
Output Directory: vazio
```

Variáveis mínimas em produção:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=...
CLIENT_ORIGIN=https://seu-frontend.example.com
```

Não configure `dist` como Output Directory: o NestJS deve ser publicado como Vercel Function, não como site estático. Para o cookie `SameSite=Lax`, prefira frontend e API em domínios pertencentes ao mesmo site ou use um proxy same-origin.

Execute migrations e seed de forma deliberada no banco de produção; não os acople automaticamente a todos os Preview Deployments.
