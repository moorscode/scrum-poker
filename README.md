# Pum Scroker - Scrum Poker

Refinement tool for Scrum-teams that work remotely.
Created this to learn development techniques and provide my team with a better tool.

Uses Vue and WebSockets via NestJS.

Pull requests and issues are very welcome.

## Features

### Voting
You can vote to set what amount of points you think the current story is. You can change your vote while one or more member has not cast a vote yet. When everybody has voted, you cannot change your vote anymore unless you start a new story.

Observers cannot vote.

Voting for a coffee-break will short-circuit the results, requiring a re-vote after the break. The coffee-break is not added the history.

Naming a story will make the history more usable. It is not required to name a story! Everybody can name or rename a story. A checkmark will show if the current name is the name registered for the story on the server.

### Rooms
You can join a room by entering a room name in input box above, or you can add a `?room={your room}` to the URL to quickly go to that room. It is recommended to share the URL if you want teammembers to join your room easily.

### Nickname
You can change your nickname at any time. The history will store the nickname you had at the moment when all votes were in. Your nickname is stored in your browser, to have it remembered when you come back the next time.

### Observer-mode
While observing you cannot vote, start a new story or reset the history. You're just a fly on the wall. Observer-mode is stored on a per-room setting, so when you return to a room you'll automatically be set as an observer or as a regular member.

### Story history
The story-history will be saved as long as there are members in the room. When a member uses the button to reset the history it will be gone from the room. The same counts when removing the last history item.

## Running via docker

There is a `docker-compose.yml.example` which can be copied to `docker-compose.yml` as a baseline.

This assumes that you also create an `.env` file with minimally the `SERVER_PORT` constant in it.
You can copy the `.env.example` file to `.env` to have starting point.
In this env-file, you can configure the `DEBUG_SECRET` to access the `debug.html` page, which will show you the current rooms-state of the server on refresh.

After copying the `docker-compose.yml` file, you can run `docker-compose up` to start the docker in watch-mode for easy development.

## Installation

```bash
$ yarn
```

## Running the app

```bash
# development
$ yarn watch:frontend
$ yarn start

# watch mode - in two separate terminals
$ yarn watch:frontend
$ yarn start:dev

# production mode
$ yarn build
$ yarn start:prod
```

## License

Scrum Poker is [GPL 3.0+](LICENSE).

Uses:
- [NestJS](https://github.com/nestjs/) under MIT license.
- [Vue.js](https://github.com/vuejs/) under MIT license.
