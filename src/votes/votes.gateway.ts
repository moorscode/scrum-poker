import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { VotesService } from './votes.service';

@WebSocketGateway({ namespace: '/pokers' })
export class VotesGateway {
  @WebSocketServer() wss: Server;

  constructor(private readonly votesService: VotesService) {}

  afterInit() {
    this.wss.on('connection', (socket) => {
      socket.on('disconnecting', () => {
        for (const room in socket.rooms) {
          this.votesService.remove(socket, room);
          this.wss.to(room).emit('votes', {
            poker: room,
            votes: this.votesService.findAll(room),
          });
        }
      });
    });
  }

  @SubscribeMessage('vote')
  vote(client: Socket, message: { poker: string; vote: number }) {
    this.votesService.vote(client, message.poker, message.vote);

    this.wss.to(message.poker).emit('votes', {
      poker: message.poker,
      votes: this.votesService.findAll(message.poker),
    });
  }

  @SubscribeMessage('getVotes')
  findAll(client: Socket, message: { poker: string }) {
    this.wss.to(message.poker).emit('votes', {
      poker: message.poker,
      votes: this.votesService.findAll(message.poker),
    });
  }
}
