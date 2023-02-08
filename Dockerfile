FROM node:16.19-alpine as build

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install

COPY nest-cli.json ./nest-cli.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY tsconfig.json ./tsconfig.json
COPY backend ./backend
COPY frontend ./frontend
COPY .env ./.env

RUN yarn build

FROM node:16.19-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY .env ./.env

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

CMD ["node", "dist/backend/main"]
