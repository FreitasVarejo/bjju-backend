# AGENTS.md — bjju-backend

Coding agent reference for the `bjju-backend` repository. Read this before making changes.

---

## Project Overview

CMS headless para o site da equipe de Jiu-Jitsu da Unicamp. Construído com **Strapi v5** (TypeScript). Expõe uma API REST consumida pelo frontend `jiujitsu-unicamp`. Em produção roda via Docker Compose com PostgreSQL, atrás do Traefik. Deploy automático via GitHub Actions self-hosted runner a cada push na `main`.

- **URL de produção (API):** `https://files.jiujitsuunicamp.com.br`
- **Porta local:** `http://localhost:1337`
- **Admin panel:** `http://localhost:1337/admin`

---

## Commands

**Package manager: `npm`.**

```bash
npm run dev          # Strapi em modo desenvolvimento (hot-reload, SQLite)
npm run build        # Compila TypeScript + admin panel para dist/
npm start            # Inicia em modo produção (requer build prévio)
npm run seed:example # Popula o banco com dados de exemplo
npm run console      # REPL interativo do Strapi
```

**Docker:**
```bash
docker compose up -d --build   # Sobe Strapi + PostgreSQL em produção
docker compose logs -f strapi  # Acompanha os logs do Strapi
docker compose down            # Para os serviços
docker compose down -v         # Para e apaga os volumes (banco de dados)
```

---

## Environment Variables

Copie `.env.example` para `.env` e preencha os valores. **Nunca commite o `.env` com secrets reais.**

| Variável | Descrição | Dev (SQLite) | Prod (Docker) |
|---|---|---|---|
| `HOST` | Interface de rede | `0.0.0.0` | `0.0.0.0` |
| `PORT` | Porta do servidor | `1337` | `1337` |
| `APP_KEYS` | Chaves da aplicação (4, separadas por vírgula) | valores simples | gerados com `crypto` |
| `API_TOKEN_SALT` | Salt para tokens de API | qualquer valor | gerado com `crypto` |
| `ADMIN_JWT_SECRET` | Secret JWT do admin panel | qualquer valor | gerado com `crypto` |
| `TRANSFER_TOKEN_SALT` | Salt para tokens de transferência | qualquer valor | gerado com `crypto` |
| `JWT_SECRET` | Secret JWT de usuários | qualquer valor | gerado com `crypto` |
| `ENCRYPTION_KEY` | Chave de criptografia | qualquer valor | gerado com `crypto` |
| `DATABASE_CLIENT` | Driver do banco | `sqlite` | `postgres` |
| `DATABASE_FILENAME` | Caminho do SQLite (dev) | `.tmp/data.db` | — |
| `DATABASE_HOST` | Host do PostgreSQL | — | `postgres` (nome do serviço) |
| `DATABASE_PORT` | Porta do PostgreSQL | — | `5432` |
| `DATABASE_NAME` | Nome do banco | — | `strapi` |
| `DATABASE_USERNAME` | Usuário do banco | — | `strapi` |
| `DATABASE_PASSWORD` | Senha do banco | — | senha forte |
| `DATABASE_SSL` | SSL no banco | — | `false` |
| `POSTGRES_DB` | Nome do banco (container Postgres) | — | `strapi` |
| `POSTGRES_USER` | Usuário (container Postgres) | — | `strapi` |
| `POSTGRES_PASSWORD` | Senha (container Postgres) | — | senha forte |

### Gerando secrets seguros

```bash
# APP_KEYS — gere 4 e separe por vírgula
node -e "const c=require('crypto'); console.log([1,2,3,4].map(()=>c.randomBytes(16).toString('base64')).join(','))"

# Demais secrets (repita para cada um)
node -e "console.log(require('crypto').randomBytes(16).toString('base64'))"
```

Em produção, o `.env` real é armazenado em `/home/saul/envs/bjju-backend.env` no servidor e copiado pelo workflow de CI durante o deploy — nunca é commitado.

---

## Project Structure

```
config/
├── admin.ts          # JWT/API secrets
├── api.ts            # Limites REST: defaultLimit=25, maxLimit=100
├── database.ts       # Multi-DB: SQLite (dev) / PostgreSQL (prod)
├── middlewares.ts    # Middlewares padrão do Strapi
├── plugins.ts        # Configuração de plugins (vazio)
└── server.ts         # HOST, PORT, APP_KEYS

src/
├── index.ts          # Lifecycle hooks: register/bootstrap (vazio)
├── admin/            # Customização do admin panel
├── api/              # Content types e controllers
│   ├── about/        # Single type
│   ├── article/      # Collection type (draft/publish habilitado)
│   ├── author/       # Collection type
│   ├── category/     # Collection type
│   └── global/       # Single type
├── components/shared/
│   ├── media.json
│   ├── quote.json
│   ├── rich-text.json
│   ├── seo.json
│   └── slider.json
└── extensions/       # Extensões de plugins (vazio)

scripts/
└── seed.js           # Script de seed de dados de exemplo (npm run seed:example)

data/
├── data.json         # Dados de exemplo para o seed
└── uploads/          # Imagens de exemplo para o seed
```

---

## Content Types

### Content Types do Projeto BJJ Unicamp

O frontend `jiujitsu-unicamp` consome os seguintes content types. Estes **não estão no código-fonte padrão** do repositório (que é baseado no template padrão do Strapi) — precisam ser criados via admin panel ou migração.

| Collection | Endpoint | Campos obrigatórios |
|---|---|---|
| `site-config` *(single type)* | `/api/site-config` | `logo` *(media)* |
| `hero-carousel` *(single type)* | `/api/hero-carousel` | `images` *(media array)* |
| `instrutores` | `/api/instrutores` | `slug`, `title`, `year` *(string)*, `course` *(string)*, `belt` *(enum)*, `photo` *(media)* |
| `treinos` | `/api/treinos` | `slug`, `title`, `weekday` *(int)*, `category` *(int)*, `startTime` *(time HH:MM:SS)*, `endTime` *(time HH:MM:SS)*, `instructor` *(string)* |
| `eventos` | `/api/eventos` | `slug`, `title`, `date` *(date YYYY-MM-DD)*, `location`, `description`, `category`, `cover` *(media)*, `gallery` *(media array)* |
| `produtos` | `/api/produtos` | `slug`, `title`, `description`, `price` *(string)*, `sizes` *(JSON array)*, `cover` *(media)*, `gallery` *(media array)*, `categoria` *(relation)* |
| `categoria-produtos` | `/api/categoria-produtos` | `slug`, `name` |

### Constraints de Enum

- **`belt`** (instrutores) — string enum: `Preta`, `Marrom`, `Roxa`, `Azul`, `Branca`
- **`weekday`** (treinos) — inteiro: `0`=Dom, `1`=Seg, `2`=Ter, `3`=Qua, `4`=Qui, `5`=Sex, `6`=Sáb
- **`category`** (treinos) — inteiro: `0`=Geral, `1`=Competição, `2`=Feminino, `3`=Noturno

### Envelope de Resposta REST

Collections:
```json
{ "data": [{ "id": 1, "documentId": "...", "slug": "...", ...fields }], "meta": { "pagination": {} } }
```
Single types:
```json
{ "data": { ...fields } }
```
Campos de mídia são **objetos**, não IDs — sempre use `populate` nas queries.

### Content Types do Template Padrão (Strapi)

O repositório inclui o template padrão do Strapi com: `Article`, `Author`, `Category`, `Global`, `About`. Estes são usados apenas como referência/exemplo e podem ser removidos.

---

## Docker & Infrastructure

### Dockerfile (multi-stage)

| Stage | Base | O que faz |
|---|---|---|
| `builder` | `node:20-alpine` | Instala deps + roda `npm run build` |
| `runner` | `node:20-alpine` | Copia apenas artefatos de runtime, usuário não-root `strapi` |

**IMPORTANTE:** O `tsconfig.json` **deve** ser copiado para o runner stage. Sem ele, o comando `strapi start` não detecta o projeto como TypeScript e usa `appDir` (`/app`) como `distDir` em vez de `/app/dist`. Isso faz o admin panel não ser encontrado em `/app/dist/build/` e a UI do Strapi não carrega.

### docker-compose.yml

Dois serviços:
- **`strapi`** (`bjju-strapi`): porta `1337`, conectado às redes `default` (interna) e `proxy_net` (Traefik). Volume `strapi-uploads` persiste os uploads de mídia. A env `URL` define a URL pública do Strapi (usado para gerar URLs absolutas de mídia).
- **`postgres`** (`bjju-postgres`): `postgres:16-alpine`, healthcheck com `pg_isready`, volume `postgres-data`.

Traefik roteia `files.jiujitsuunicamp.com.br` → container Strapi na porta 1337.

---

## CI/CD

O workflow `.github/workflows/deploy.yml` dispara a cada push na `main`. Usa um **self-hosted runner** no próprio servidor. O runner:

1. Faz checkout do código
2. Copia `/home/saul/envs/bjju-backend.env` → `.env`
3. Roda `docker compose up -d --build --remove-orphans`
4. Executa `docker image prune -f`

Não há GitHub Secrets necessários — o runner já tem acesso local ao `.env` de produção.

---

## Code Style

- TypeScript com `strict: false` (configuração padrão do Strapi)
- `target: ES2019`, `module: CommonJS`
- Siga os padrões do Strapi para novos content types e customizações
- Não adicione lógica de negócio em `src/index.ts` sem necessidade clara
