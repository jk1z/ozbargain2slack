FROM node:10.16.3-alpine

WORKDIR /src

COPY package*.json ./

RUN npm ci --only=production

COPY . .

CMD [ "node", "app/index.js" ]