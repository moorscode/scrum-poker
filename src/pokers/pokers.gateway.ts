import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { PokersService } from './pokers.service';
import { Server, Socket } from 'socket.io';
import { PointsService } from '../points/points.service';
import { var_export } from 'locutus/php/var';

@WebSocketGateway({ namespace: '/pokers' })
export class PokersGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly pokersService: PokersService) {
  }

  afterInit(): void {
    this.server.on('connection', (socket) => {
      // Let the client know the points that can be chosen from.
      socket.emit('points', { points: PointsService.getPoints() });
      socket.emit('userId', this.generateId());

      // Clean up after disconnection.
      socket.on('disconnecting', () => {
        for (const room in socket.rooms) {
          if (!room.includes('/pokers#')) {
            this.pokersService.disconnect(socket, room);
          }

          this.sendAllVotes(room);
          this.listMembers(room);
        }
      });
    });
  }

  /**
   * Generates a user Id.
   *
   * @returns {string} User Id.
   * @private
   */
  private generateId(): string {
    return (
      Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    ).toUpperCase();
  }

  @SubscribeMessage('identify')
  identify(client: Socket, message: { id: string }): void {
    this.pokersService.greet(client, message.id);
    client.emit('welcome');
  }

  @SubscribeMessage('exit')
  exit(client: Socket): void {
    this.pokersService.exit(client);
  }

  @SubscribeMessage('join')
  join(client: Socket, message: { poker: string; name?: string }): void {
    this.pokersService.join(client, message.poker, message.name);
    const vote = this.pokersService.getVote(client, message.poker);

    client.emit('joined', { poker: message.poker, vote });

    this.sendAllVotes(message.poker);
    this.sendStories(message.poker);
    this.sendStoryName(message.poker);
    this.listMembers(message.poker);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, message: { poker: string }): void {
    this.pokersService.leave(client, message.poker);

    this.listMembers(message.poker);
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('vote')
  vote(client: Socket, message: { poker: string; vote }): void {
    this.pokersService.vote(client, message.poker, message.vote);

    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('nickname')
  setNickname(client: Socket, message: { name: string; poker: string }): void {
    this.pokersService.setName(message.poker, client, message.name);

    this.listMembers(message.poker);
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('getVotes')
  findAllVotes(client: Socket, message: { poker: string }): void {
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('newStory')
  newStory(client: Socket, message: { poker: string; result?: string }): void {
    this.pokersService.newStory(message.poker, parseFloat(message.result));

    this.sendAllVotes(message.poker);
    this.sendStories(message.poker);
    this.sendStoryName(message.poker);
  }

  @SubscribeMessage('story')
  story(client: Socket, message: { poker: string; name: string }): void {
    this.pokersService.setStoryName(message.poker, message.name);

    this.sendStoryName(message.poker);
  }

  @SubscribeMessage('popHistory')
  popHistory(client: Socket, message: { poker: string }): void {
    this.pokersService.popHistory(message.poker);

    this.sendStories(message.poker);
  }

  @SubscribeMessage('resetHistory')
  resetHistory(client: Socket, message: { poker: string }): void {
    this.pokersService.resetHistory(message.poker);

    this.sendStories(message.poker);
  }

  @SubscribeMessage('observe')
  observer(client: Socket, message: { poker: string }): void {
    this.pokersService.observe(client, message.poker);

    this.listMembers(message.poker);
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('debug')
  getDebug(client: Socket, message: { secret: string }): any {
    if (
      process.env.DEBUG_SECRET &&
      message.secret === process.env.DEBUG_SECRET
    ) {
      client.emit('debug', var_export(this.pokersService.debug(), true));
    }
  }

  /**
   * Sends the members list to the requested room.
   *
   * @param {string} poker The room.
   *
   * @private
   */
  private listMembers(poker: string): void {
    this.server.to(poker).emit('member-list', {
      ...this.pokersService.getClientNames(poker),
    });
  }

  /**
   * Sends all votes to a room.
   *
   * @param {string} poker Room to send the votes for.
   *
   * @private
   */
  private sendAllVotes(poker: string): void {
    this.server.to(poker).emit('votes', {
      poker: poker,
      ...this.pokersService.getVotes(poker),
      names: this.pokersService.getVoterNames(poker),
      votedNames: this.pokersService.getVotedNames(poker),
    });
  }

  /**
   * Sends the story-history to all clients in a room.
   *
   * @param {string} room The room.
   *
   * @private
   */
  private sendStories(room: string): void {
    this.server.to(room).emit('stories', {
      stories: this.pokersService.getStories(room),
    });
  }

  /**
   * Sends the story name to all room members.
   *
   * @param {string} room The room.
   *
   * @private
   */
  private sendStoryName(room: string): void {
    this.server.to(room).emit('story', {
      name: this.pokersService.getStoryName(room),
    });
  }
}
