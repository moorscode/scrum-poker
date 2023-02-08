FROM node:16.19-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --network-timeout 3600000

COPY nest-cli.json ./nest-cli.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY tsconfig.json ./tsconfig.json
COPY backend ./backend
COPY frontend ./frontend
COPY .env ./.env

RUN yarn build

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["node", "dist/backend/main"]
