import {
  WebSocketGateway,
  SubscribeMessage,
  WebSocketServer,
} from '@nestjs/websockets';
import { PokersService } from './pokers.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ namespace: '/pokers' })
export class PokersGateway {
  @WebSocketServer() wss: Server;

  constructor(private readonly pokersService: PokersService) {}

  afterInit() {
    this.wss.on('connection', (socket) => {
      socket.on('disconnecting', () => {
        for (const room in socket.rooms) {
          this.pokersService.leave(socket, room);

          this.wss.to(room).emit('membersUpdated', {
            poker: room,
            members: this.pokersService.getMembers(room),
          });
        }
      });
    });
  }

  @SubscribeMessage('join')
  join(client: Socket, message: { id: string }) {
    this.pokersService.join(client, message.id);

    this.wss.to(message.id).emit('membersUpdated', {
      poker: message.id,
      members: this.pokersService.getMembers(message.id),
    });

    client.emit('joined', { poker: message.id });
  }
}
