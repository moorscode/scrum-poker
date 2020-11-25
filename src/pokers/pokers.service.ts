import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PointsService } from '../points/points.service';

interface currentVotes {
  voteCount: number;
  votes: string[];
  displayVotes: string[];
}

@Injectable()
export class PokersService {
  pokers = [];
  votes = [];
  changedVotes = [];
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
      delete this.changedVotes[poker][client.id];
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
    this.changedVotes[poker] = this.changedVotes[poker] || {};

    // Prevent cheaters from entering bogus point totals.
    const allowedPoints = PointsService.getPoints();

    if (!allowedPoints.includes(vote)) {
      return;
    }

    // If everybody has voted, record their change in vote.
    if (this.pokers[poker].length === Object.keys(this.votes[poker]).length) {
      this.changedVotes[poker][client.id] = vote;
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
    const changedVotes = this.changedVotes[poker] || {};

    const voteCount = Object.keys(votes).length;
    const memberCount = (this.pokers[poker] || []).length;

    // When all votes are in, show the actual votes.
    if (memberCount === voteCount) {
      const voteList = [];
      const displayVotes = [];

      for (const client in votes) {
        if (!votes.hasOwnProperty(client)) {
          continue;
        }

        const initialVote = votes[client];
        let voteToCount = initialVote;
        let voteToDisplay = initialVote;
        if (
          changedVotes.hasOwnProperty(client) &&
          changedVotes[client] !== initialVote
        ) {
          voteToDisplay += ' -> ' + changedVotes[client];
          voteToCount = changedVotes[client];
        }
        displayVotes.push(voteToDisplay);
        voteList.push(voteToCount);
      }

      return {
        voteCount: voteList.length,
        votes: voteList,
        displayVotes: displayVotes,
      };
    }

    // Otherwise show an X for voted, ? for unvoted.
    const hiddenVotes = Array(memberCount)
      .fill('X', 0, voteCount)
      .fill('?', voteCount, memberCount);
    return {
      voteCount,
      votes: hiddenVotes,
      displayVotes: hiddenVotes,
    };
  }

  /**
   * Resets the votes for a room.
   *
   * @param {string} poker Room to reset.
   */
  resetVotes(poker: string): void {
    this.votes[poker] = {};
    this.changedVotes[poker] = {};
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
