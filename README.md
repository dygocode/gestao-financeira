<h1 align="center">Aplicação de Gestão financeira</h1>

### Uma plataforma interna para registrar e acompanhar as movimentações financeiras por categoria - despesas operacionais, receitas de clientes, reembolsos, entre outros.

---

*Link do deploy público*

```sh
# frontend
https://frontend-gestao-financeira.vercel.app

# backend
https://backend-gestao-financeira.vercel.app
```

---

*Trade-offs e decisões técnicas relevantes*

- Gerenciador de estado: Zustand

---

*Pré-requisitos*

![Langs](https://skillicons.dev/icons?i=nodejs,nestjs,react)
![DevOps](https://skillicons.dev/icons?i=docker,postgresql,bash)

```sh
# frontend
React ˆ19

# backend
nodeJS ^26.13.0 LTS

# banco de dados
PostgreSQL ^18

# local
docker LTS
```

---

*Instalação*

```sh
cd frontend
npm install

cd backend
npm install
```

---

*Como iniciar o servidor (backend e frontend)*

```sh
# desenvolvimento
docker compose up -d
```

---

*Como configurar as variáveis de ambiente (.env)*

- Gere um arquivo .env na raíz de cada repositório seguindo os esquemas abaixo:

```sh
# esquema variáveis ambiente: Frontend
API_ENDPOINT="localhost:3000"

# esquema variáveis ambiente: Backend
JWT_KEY="ex3mpl0_ch4v3_f0rt3"
```

---

*Como rodar as migrations do banco de dados*

```sh
npm run migrate
```

---

*Credenciais de um usuário seed para teste*

```txt
Email: admin@fintech.com
Senha: Admin@123
```

---