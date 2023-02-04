FROM node:14.15-alpine AS development

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

FROM node:14.15-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY --from=development /usr/src/app/dist/ ./dist

CMD ["node", "dist/backend/main"]
