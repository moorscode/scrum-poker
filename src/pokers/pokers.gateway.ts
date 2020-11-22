import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { PokersService } from './pokers.service';
import { Server, Socket } from 'socket.io';
import { PointsService } from '../points/points.service';

@WebSocketGateway({ namespace: '/pokers' })
export class PokersGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly pokersService: PokersService) {}

  afterInit() {
    this.server.on('connection', (socket) => {
      socket.emit('points', { points: PointsService.getPoints() });

      socket.on('disconnecting', () => {
        for (const room in socket.rooms) {
          this.pokersService.leave(socket, room);

          this.server.to(room).emit('membersUpdated', {
            poker: room,
            members: this.pokersService.getMembers(room),
          });

          this.pokersService.removeVotes(socket, room);

          this.sendAllVotes(room);
        }
      });
    });
  }

  @SubscribeMessage('join')
  join(client: Socket, message: { poker: string }) {
    this.pokersService.join(client, message.poker);

    this.server.to(message.poker).emit('membersUpdated', {
      poker: message.poker,
      members: this.pokersService.getMembers(message.poker),
    });

    client.emit('joined', { poker: message.poker });
  }

  @SubscribeMessage('vote')
  vote(client: Socket, message: { poker: string; vote }) {
    this.pokersService.vote(client, message.poker, message.vote);

    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('getVotes')
  findAllVotes(client: Socket, message: { poker: string }) {
    this.sendAllVotes(message.poker);
  }

  @SubscribeMessage('resetVotes')
  resetVotes(client: Socket, message: { poker: string }) {
    this.pokersService.resetVotes(message.poker);

    this.sendAllVotes(message.poker);
  }

  sendAllVotes(poker: string) {
    const votes = this.pokersService.getVotes(poker);
    this.server.to(poker).emit('votes', {
      poker: poker,
      votes: votes.votes,
      voteCount: votes.voteCount,
    });
  }
}
