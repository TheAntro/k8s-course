FROM node:24-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


FROM node:24-slim AS runner

WORKDIR /app
ENV LOG_PATH=/var/log/shared/hash.log
RUN mkdir -p /var/log/shared

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

USER node

CMD ["node", "dist/app.js"]
