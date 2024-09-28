FROM node:20.4.0-bullseye-slim

WORKDIR /usr/src/app

COPY ./package*.json .

RUN npm ci --omit=dev

COPY src/ .

CMD [ "node", "server.mjs" ]