# =============================================================================
# Stage 1: builder
# Instala dependências, compila TypeScript e builda o admin panel do Strapi
# =============================================================================
FROM node:20-alpine AS builder

# Dependências nativas necessárias para compilar pacotes como better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copia manifests primeiro para aproveitar cache de camadas do Docker
COPY package.json package-lock.json ./

# Instala todas as dependências (incluindo dev, necessárias para o build)
RUN npm ci

# Copia o restante do código-fonte
COPY . .

# Compila o TypeScript e o admin panel do Strapi
# NODE_ENV=production garante que o admin seja buildado em modo otimizado
ENV NODE_ENV=production
RUN npm run build

# =============================================================================
# Stage 2: runner
# Imagem final enxuta — só o necessário para rodar em produção
# =============================================================================
FROM node:20-alpine AS runner

RUN apk add --no-cache python3 make g++

WORKDIR /app

# Cria usuário não-root para rodar a aplicação
RUN addgroup -S strapi && adduser -S strapi -G strapi

# Copia apenas o necessário do stage builder
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src
COPY --from=builder /app/database ./database
COPY --from=builder /app/public ./public
COPY --from=builder /app/favicon.png ./favicon.png

# Cria diretórios de dados e garante permissões ao usuário strapi
RUN mkdir -p /app/.tmp /app/public/uploads && \
    chown -R strapi:strapi /app

USER strapi

EXPOSE 1337

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

CMD ["npm", "start"]
