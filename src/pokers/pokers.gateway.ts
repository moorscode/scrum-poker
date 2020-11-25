import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
  OnGatewayInit,
} from '@nestjs/websockets';
import { PokersService } from './pokers.service';
import { Server, Socket } from 'socket.io';
import { PointsService } from '../points/points.service';

@WebSocketGateway({ namespace: '/pokers' })
export class PokersGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly pokersService: PokersService) {}

  afterInit(): void {
    this.server.on('connection', (socket) => {
      // Let the client know the points that can be chosen from.
      socket.emit('points', { points: PointsService.getPoints() });

      // Clean up after disconnection.
      socket.on('disconnecting', () => {
        for (const room in socket.rooms) {
          this.pokersService.leave(socket, room);

          this.updateMembers(room);
          this.sendAllVotes(room);
        }
      });
    });
  }

  @SubscribeMessage('join')
  join(client: Socket, message: { poker: string; name?: string }): void {
    this.pokersService.join(client, message.poker);
    this.pokersService.setName(client, message.name, message.poker);

    client.emit('joined', { poker: message.poker });

    this.updateMembers(message.poker);
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('leave')
  leave(client: Socket, message: { poker: string }): void {
    this.pokersService.leave(client, message.poker);

    this.updateMembers(message.poker);
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('vote')
  vote(client: Socket, message: { poker: string; vote }): void {
    this.pokersService.vote(client, message.poker, message.vote);

    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('nickname')
  setNickname(client: Socket, message: { name: string; poker: string }): void {
    this.pokersService.setName(client, message.name, message.poker);
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('getVotes')
  findAllVotes(client: Socket, message: { poker: string }): void {
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('resetVotes')
  resetVotes(client: Socket, message: { poker: string }): void {
    this.pokersService.resetVotes(message.poker);

    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('observe')
  observer(client: Socket, message: { poker: string }): void {
    this.pokersService.observe(client, message.poker);

    this.updateMembers(message.poker);
    this.sendAllVotes(message.poker);
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
      names: this.pokersService.getNames(poker),
      votedNames: this.pokersService.getVotedNames(poker),
    });
  }

  /**
   * Sends an actual members count to a room.
   *
   * @param {string} room The room.
   *
   * @private
   */
  private updateMembers(room: string): void {
    this.server.to(room).emit('membersUpdated', {
      poker: room,
      members: this.pokersService.getMembers(room),
    });
  }
}
