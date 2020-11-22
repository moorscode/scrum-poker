import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PointsService } from '../points/points.service';

@Injectable()
export class PokersService {
  pokers = [];
  votes = [];

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

  vote(client: Socket, poker: string, vote) {
    this.votes[poker] = this.votes[poker] || {};

    // If everybody has voted, don't allow any changes until reset.
    if (this.pokers[poker].length === Object.keys(this.votes[poker]).length) {
      return;
    }

    // Prevent cheaters from entering bogus point totals.
    const points = PointsService.getPoints();
    if (points.indexOf(vote) === -1) {
      return;
    }

    this.votes[poker][client.id] = vote;
  }

  getVotes(poker: string) {
    const votes = this.votes[poker] || {};

    const voteCount = Object.keys(votes).length;
    const memberCount = (this.pokers[poker] || []).length;

    if (memberCount === voteCount) {
      const voteList = [];
      for (const client in votes) {
        voteList.push(votes[client]);
      }

      return {
        voteCount: voteList.length,
        votes: voteList,
      };
    }

    return {
      voteCount,
      votes: Array.apply(null, Array(voteCount))
        .map((_) => 'X')
        .concat(
          Array.apply(null, Array(memberCount - voteCount)).map((_) => '?'),
        ),
    };
  }

  resetVotes(poker: string) {
    this.votes[poker] = {};
  }

  removeVotes(client: Socket, poker: string) {
    if (!this.votes[poker]) return;
    delete this.votes[poker][client.id];
  }
}
