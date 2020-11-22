import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class VotesService {
  pokers = [];

  vote(client: Socket, poker: string, vote: number) {
    this.pokers[poker] = this.pokers[poker] || {};
    this.pokers[poker][client.id] = vote;

    return this.pokers[poker];
  }

  findAll(poker: string) {
    const votes = this.pokers[poker] || {};

    const voteList = [];
    for (const vote in votes) {
      voteList.push(votes[vote]);
    }

    return voteList;
  }

  remove(client: Socket, poker: string) {
    if (!this.pokers[poker]) return;
    delete this.pokers[poker][client.id];
  }
}
