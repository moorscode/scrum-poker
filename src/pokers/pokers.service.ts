import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class PokersService {
  pokers = [];

  join(client: Socket, poker: string) {
    this.pokers[poker] = this.pokers[poker] || [];

    if (this.pokers[poker].indexOf(client) !== -1) {
      return;
    }

    this.pokers[poker].push(client);
    client.join(poker);
  }

  leave(client: Socket, poker: string) {
    if (!this.pokers[poker]) {
      return;
    }

    const index = this.pokers[poker].indexOf(client);
    if (index !== -1) {
      this.pokers[poker].splice(index, 1);
    }
  }

  getMembers(poker: string) {
    return (this.pokers[poker] || []).length;
  }
}
