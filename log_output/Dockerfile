FROM node:24-slim

WORKDIR /app

COPY package*.json .

RUN npm install --only=production

COPY . .

USER node

CMD ["npm", "start"]