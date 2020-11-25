import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PointsService } from '../points/points.service';

interface currentVotes {
  voteCount: number;
  votes: string[];
}

@Injectable()
export class PokersService {
  pokers = [];
  votes = [];
  names = {};

  /**
   * Lets a client join a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  join(client: Socket, poker: string) {
    this.pokers[poker] = this.pokers[poker] || [];

    if (this.pokers[poker].indexOf(client) !== -1) {
      return;
    }

    this.setName(client, 'Unnamed' + Math.floor(Math.random() * 100000), poker);

    this.pokers[poker].push(client);
    client.join(poker);
  }

  /**
   * Lets a client leave a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  leave(client: Socket, poker: string) {
    if (this.pokers[poker]) {
      const index = this.pokers[poker].indexOf(client);
      if (index !== -1) {
        this.pokers[poker].splice(index, 1);
      }
    }

    if (this.votes[poker]) {
      delete this.votes[poker][client.id];
    }

    if (this.names[poker]) {
      console.log(client.id);
      delete this.names[poker][client.id];
    }

    client.leave(poker);
  }

  /**
   * Removes the client from the room and votes lists.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  observe(client: Socket, poker: string) {
    const index = this.pokers[poker].indexOf(client);
    if (index !== -1) {
      this.pokers[poker].splice(index, 1);
    }

    if (this.votes[poker]) {
      delete this.votes[poker][client.id];
    }

    if (this.names[poker]) {
      delete this.names[poker][client.id];
    }
  }

  setName(client: Socket, name: string, poker: string) {
    if (!name) return;

    this.names[poker] = this.names[poker] || {};
    this.names[poker][client.id] = name;
  }

  getNames(poker: string) {
    if (!this.names[poker]) return [];

    return Object.values(this.names[poker]);
  }

  getVotedNames(poker: string) {
    if (!this.names[poker]) return [];
    if (!this.votes[poker]) return [];

    const clientIds = Object.keys(this.votes[poker]);
    const list = [];
    for (const clientId of clientIds) {
      list.push(this.names[poker][clientId]);
    }

    return list;
  }

  /**
   * Retrieves the number of members in a room.
   *
   * @param {string} poker The room.
   *
   * @returns {number} Number of members in the room.
   */
  getMembers(poker: string) {
    return (this.pokers[poker] || []).length;
  }

  /**
   * Registers a vote for a client in a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   * @param {number|string} vote The vote.
   */
  vote(client: Socket, poker: string, vote): void {
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

  /**
   * Retrieves the votes for a room.
   *
   * @param {string} poker Room.
   *
   * @returns currentVotes Votes in that room. Obfuscated if not all votes are in yet.
   */
  getVotes(poker: string): currentVotes {
    const votes = this.votes[poker] || {};

    const voteCount = Object.keys(votes).length;
    const memberCount = (this.pokers[poker] || []).length;

    // When all votes are in, show the actual votes.
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

    // Otherwise show an X for voted, ? for unvoted.
    return {
      voteCount,
      votes: Array.apply(null, Array(voteCount))
        .map((_) => 'X')
        .concat(
          Array.apply(null, Array(memberCount - voteCount)).map((_) => '?'),
        ),
    };
  }

  /**
   * Resets the votes for a room.
   *
   * @param {string} poker Room to reset.
   */
  resetVotes(poker: string): void {
    this.votes[poker] = {};
  }

  /**
   * Removes the vote of a client.
   *
   * @param {Socket} client Client.
   * @param {string} poker Room.
   */
  removeVote(client: Socket, poker: string): void {
    if (!this.votes[poker]) return;
    delete this.votes[poker][client.id];
  }
}
