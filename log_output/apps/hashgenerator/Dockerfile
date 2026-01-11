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
ENV COUNT_PATH=/var/log/shared/pingpong_requests.count
RUN mkdir -p /var/log/shared

# Copy production deps and built output from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

USER node

CMD ["node", "dist/app.js"]