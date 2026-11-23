FROM node:24-alpine AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

COPY nest-cli.json ./nest-cli.json
COPY tsconfig.build.json ./tsconfig.build.json
COPY tsconfig.json ./tsconfig.json
COPY backend ./backend
COPY frontend ./frontend
COPY .env ./.env

RUN yarn build

# Strip build tooling and frontend libraries; only server runtime dependencies are shipped.
RUN yarn install --frozen-lockfile --production --ignore-scripts --prefer-offline \
	&& yarn cache clean

FROM node:24-alpine

# Pull in patched OS packages, and drop the package managers bundled with the base image:
# the app never uses them at runtime and their vendored dependencies are a common CVE source.
RUN apk upgrade --no-cache \
	&& rm -rf /usr/local/lib/node_modules /usr/local/bin/npm /usr/local/bin/npx \
		/usr/local/bin/corepack /usr/local/bin/yarn /usr/local/bin/yarnpkg /opt/yarn-*

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY .env ./.env

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

USER node

EXPOSE 3000

CMD ["node", "dist/backend/main"]
