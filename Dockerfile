# -----------------------------
# Stage 1 - Install dependencies
# -----------------------------
FROM node:22-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci

# -----------------------------
# Stage 2 - Build Next.js
# -----------------------------
FROM node:22-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NODE_ENV=production

RUN npm run build

# -----------------------------
# Stage 3 - Production Image
# -----------------------------
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

COPY --from=builder /app .

EXPOSE 8080

CMD ["npm", "start"]
