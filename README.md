# bjju-backend

Backend do projeto BJJ Unicamp — um CMS headless construído com [Strapi v5](https://strapi.io/), expondo uma API REST para o frontend.

---

## Sumário

- [Pré-requisitos](#pré-requisitos)
- [Rodando em modo desenvolvimento (dev)](#rodando-em-modo-desenvolvimento-dev)
- [Rodando em modo produção (prod)](#rodando-em-modo-produção-prod)
- [Rodando com Docker (recomendado para prod)](#rodando-com-docker-recomendado-para-prod)
- [Variáveis de ambiente (.env)](#variáveis-de-ambiente-env)
- [Comandos úteis](#comandos-úteis)
- [Deploy automático via GitHub Actions](#deploy-automático-via-github-actions)

---

## Pré-requisitos

- **Node.js** `>=20.0.0 <=24.x.x`
- **npm** `>=6.0.0`
- **Docker** e **Docker Compose** (apenas para o modo Docker/prod)

---

## Rodando em modo desenvolvimento (dev)

O modo `develop` do Strapi compila o TypeScript e reinicia o servidor automaticamente a cada mudança nos arquivos. O admin panel também é recompilado em hot-reload.

```bash
# 1. Clone o repositório e entre na pasta do projeto
git clone <url-do-repo>
cd bjju-backend

# 2. Copie o arquivo de exemplo de variáveis de ambiente
cp .env.example .env

# 3. Preencha os valores no .env (veja a seção abaixo)
#    Para dev local com SQLite, os defaults já funcionam —
#    mas os secrets precisam ser gerados (veja "Gerando secrets")

# 4. Instale as dependências
npm install

# 5. Inicie o servidor em modo dev
npm run dev
```

O servidor estará disponível em: `http://localhost:1337`
O painel admin em: `http://localhost:1337/admin`

> Na primeira execução, o Strapi vai pedir para você criar um usuário administrador pelo browser.

---

## Rodando em modo produção (prod)

Em produção, o Strapi precisa ser compilado primeiro (`build`) e depois iniciado (`start`). Não use `npm run dev` em produção — ele é mais lento e não é otimizado.

```bash
# 1. Garanta que o .env está preenchido com os valores de produção
#    (use PostgreSQL e secrets seguros — veja a seção .env)

# 2. Instale as dependências (sem devDependencies)
npm install --omit=dev

# 3. Compile o projeto (gera o dist/ e o admin panel buildado)
npm run build

# 4. Inicie o servidor
npm start
```

O servidor estará disponível em `http://0.0.0.0:1337` (ou na porta configurada em `PORT`).

> **Importante:** o comando `npm start` (`strapi start`) serve os arquivos já compilados da pasta `dist/`. Se você alterar o código-fonte, precisa rodar `npm run build` novamente antes de reiniciar.

---

## Rodando com Docker (recomendado para prod)

A forma mais reproduzível de rodar o projeto em produção é via Docker Compose. Ele sobe o Strapi junto com um banco PostgreSQL já configurado.

```bash
# 1. Copie e preencha o .env
cp .env.example .env
# Edite o .env com seus secrets e configure DATABASE_CLIENT=postgres

# 2. Suba os serviços
docker compose up -d --build

# 3. Acompanhe os logs
docker compose logs -f strapi
```

Para derrubar os serviços:

```bash
docker compose down
```

Para derrubar e apagar os volumes (banco de dados):

```bash
docker compose down -v
```

---

## Variáveis de ambiente (.env)

Copie `.env.example` para `.env` e preencha os valores. **Nunca commite o arquivo `.env` com secrets reais.**

```ini
# --- Servidor ---
HOST=0.0.0.0          # Interface de rede que o servidor vai escutar
PORT=1337             # Porta do servidor

# --- Secrets da aplicação ---
# Gere cada um com: node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
APP_KEYS=             # Lista de chaves separadas por vírgula (ex: "chave1,chave2,chave3,chave4")
API_TOKEN_SALT=       # Salt para tokens de API
ADMIN_JWT_SECRET=     # Secret do JWT do painel admin
TRANSFER_TOKEN_SALT=  # Salt para tokens de transferência de dados
JWT_SECRET=           # Secret do JWT de usuários (plugin users-permissions)
ENCRYPTION_KEY=       # Chave de criptografia para dados sensíveis

# --- Banco de dados ---
DATABASE_CLIENT=sqlite              # "sqlite", "postgres" ou "mysql"

# SQLite (padrão para dev):
DATABASE_FILENAME=.tmp/data.db      # Caminho do arquivo SQLite

# PostgreSQL (para prod com Docker):
DATABASE_HOST=postgres              # Nome do serviço no docker-compose (ou hostname externo)
DATABASE_PORT=5432
DATABASE_NAME=strapi
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=sua_senha_segura
DATABASE_SSL=false                  # true se o banco exigir SSL (ex: banco gerenciado em nuvem)
```

### Gerando secrets seguros

Execute cada comando abaixo e cole o resultado no `.env`:

```bash
# APP_KEYS — gere 4 e separe por vírgula
node -e "const c=require('crypto'); console.log([1,2,3,4].map(()=>c.randomBytes(16).toString('base64')).join(','))"

# Demais secrets (repita para cada um: API_TOKEN_SALT, ADMIN_JWT_SECRET, etc.)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

### Diferença dev vs. prod no .env

| Variável                   | Dev (local)                | Prod (Docker)                |
| -------------------------- | -------------------------- | ---------------------------- |
| `DATABASE_CLIENT`          | `sqlite`                   | `postgres`                   |
| `DATABASE_FILENAME`        | `.tmp/data.db`             | —                            |
| `DATABASE_HOST`            | —                          | `postgres` (nome do serviço) |
| `DATABASE_PASSWORD`        | —                          | senha forte                  |
| Secrets (`APP_KEYS`, etc.) | valores simples para teste | valores gerados com `crypto` |

---

## Comandos úteis

```bash
# Iniciar em modo desenvolvimento (hot-reload)
npm run dev

# Compilar para produção
npm run build

# Iniciar em modo produção (requer build prévio)
npm start

# Popular o banco com dados de exemplo (artigos, autores, categorias)
npm run seed:example

# Abrir console interativo do Strapi (REPL)
npm run console
```

---

## Deploy automático via GitHub Actions

O repositório inclui um workflow em `.github/workflows/deploy.yml` que faz o deploy automático a cada push na branch `main`.

### Como funciona

O workflow usa um **self-hosted runner** rodando diretamente no servidor de produção — não há SSH externo envolvido. A cada push:

1. O runner faz checkout do código no servidor
2. Copia o arquivo `.env` de produção de `/home/saul/envs/bjju-backend.env` para o diretório do projeto
3. Roda `docker compose up -d --build --remove-orphans` para recompilar e reiniciar os containers
4. Remove imagens Docker antigas com `docker image prune -f`

### Não há GitHub Secrets necessários

Como o runner já roda no servidor, não são necessárias credenciais SSH nem outros secrets no GitHub. O único pré-requisito é que o runner esteja registrado e ativo no repositório.

### Configurando o servidor pela primeira vez

```bash
# No servidor, clone o repositório no diretório esperado pelo runner
git clone <url-do-repo>
cd bjju-backend

# Crie o arquivo de .env de produção no caminho esperado pelo workflow
cp .env.example /home/saul/envs/bjju-backend.env
nano /home/saul/envs/bjju-backend.env  # preencha todos os valores de produção

# Suba os containers pela primeira vez manualmente
cp /home/saul/envs/bjju-backend.env .env
docker compose up -d --build
```

A partir daí, todo push na `main` fará o deploy automaticamente.
