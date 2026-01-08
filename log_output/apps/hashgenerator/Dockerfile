FROM node:24-slim

WORKDIR /app
ENV LOG_PATH=/var/log/shared/hash.log
RUN mkdir -p /var/log/shared

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

USER node

CMD ["node", "index.js"]