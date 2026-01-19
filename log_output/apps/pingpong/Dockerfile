FROM node:24 AS builder
WORKDIR /app

# Install all deps (including dev) to build TypeScript
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .
RUN npm run build

FROM node:24-slim
WORKDIR /app

# Copy runtime artifacts from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

USER node

CMD ["node", "dist/src/app.js"]