## Description

Refinement tool for Scrum-teams that work remotely.
Created this to learn development techniques and provide my team with a better tool.


Uses Vue and WebSockets via NestJS.

Pull requests and issues are very welcome.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Running via docker

There is a `docker-compose.yml.example` which can be copied to `docker-compose.yml` as a baseline.

This assumes that you also create an `.env` file with minimally the `SERVER_PORT` constant in it.
You can copy the `.env.example` file to `.env` to have starting point.
In this env-file, you can configure the `DEBUG_SECRET` to access the `debug.html` page, which will show you the current rooms-state of the server on refresh.

After copying the `docker-compose.yml` file, you can run `docker-compose up` to start the docker in watch-mode for easy development.

## License

Scrum Poker is [GPL 3.0+](LICENSE).

Uses:
- [NestJS](https://github.com/nestjs/) under MIT license.
- [Vue.js](https://github.com/vuejs/) under MIT license.
