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
  public join(client: Socket, poker: string) {
    this.setName(client, 'Unnamed' + Math.floor(Math.random() * 100000), poker);

    if (this.pokerHasClient(poker, client)) {
      return;
    }

    this.addClientToPoker(poker, client);

    client.join(poker);
  }

  /**
   * Lets a client leave a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  public leave(client: Socket, poker: string) {
    this.observe(client, poker);

    client.leave(poker);
  }

  /**
   * Removes the client from the room and votes lists.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  public observe(client: Socket, poker: string) {
    this.removeFromPoker(poker, client);
    this.removeFromVotes(poker, client);
    this.removeFromNames(poker, client);
  }

  /**
   * Set a name for a client.
   *
   * @param {Socket} client The client.
   * @param {string} name The name.
   * @param {string} poker The poker.
   */
  public setName(client: Socket, name: string, poker: string) {
    if (!name) return;

    this.addClientToNames(poker, client, name);
  }

  /**
   * Retrieves the names of all clients for a room.
   *
   * @param {string} poker The poker.
   */
  public getPokerNames(poker: string) {
    return this.getNames(poker);
  }

  /**
   * Retrieves all names of voted clients.
   *
   * @param {string} poker The room.
   */
  public getVotedNames(poker: string) {
    if (!this.getNames(poker) || !this.getVotes(poker)) {
      return [];
    }

    const list = [];
    for (const clientId of this.getPokerClientIds(poker)) {
      list.push(this.getClientName(poker, clientId));
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
  public getMemberCount(poker: string) {
    return this.getPokerClients(poker).length;
  }

  /**
   * Registers a vote for a client in a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   * @param {number|string} vote The vote.
   */
  public vote(client: Socket, poker: string, vote): void {
    // If everybody has voted, don't allow any changes until reset.
    if (this.getMemberCount(poker) === this.getVoteCount(poker)) {
      return;
    }

    // Prevent cheaters from entering bogus point totals.
    if (!PointsService.getPoints().includes(vote)) {
      return;
    }

    this.addPokerVote(poker, client, vote);
  }

  /**
   * Retrieves the votes for a room.
   *
   * @param {string} poker Room.
   *
   * @returns currentVotes Votes in that room. Obfuscated if not all votes are in yet.
   */
  public getPokerVotes(poker: string): currentVotes {
    const votes = this.getVotes(poker);

    const voteCount = this.getVoteCount(poker);
    const memberCount = this.getMemberCount(poker);

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
  public resetVotes(poker: string): void {
    this.setVotes(poker, {});
  }

  /**
   * Lists all names in a room.
   *
   * @param {string} poker The room.
   *
   * @returns {string[]} List of names.
   *
   * @private
   */
  private getNames(poker: string): string[] {
    if (!this.names[poker]) return [];

    return Object.values(this.names[poker]);
  }

  /**
   * Lists all poker clients.
   *
   * @param {string} poker The room.
   *
   * @returns {Socket[]} Clients.
   *
   * @private
   */
  private getPokerClients(poker: string): Socket[] {
    return this.pokers[poker] || [];
  }

  /**
   * Adds a client to a room.
   *
   * @param {string} poker The room.
   * @param {Socket} client The client.
   *
   * @private
   */
  private addClientToPoker(poker: string, client: Socket): void {
    this.pokers[poker] = this.pokers[poker] || [];
    this.pokers[poker].push(client);
  }

  /**
   * Determines if a client is in a room.
   *
   * @param {string} poker The room to search.
   * @param {Socket} client Client to find.
   *
   * @returns {boolean} True if client is in the room.
   */
  private pokerHasClient(poker: string, client: Socket): boolean {
    if (!this.pokers[poker]) {
      return false;
    }

    return this.pokers[poker].includes(client);
  }

  /**
   * Adds a name to a client.
   *
   * @param {string} poker The room the client is in.
   * @param {Socket} client  The client.
   * @param {string} name The name.
   *
   * @private
   */
  private addClientToNames(poker: string, client: Socket, name: string): void {
    this.names[poker] = this.names[poker] || {};
    this.names[poker][client.id] = name;
  }

  /**
   * Removes a client name.
   *
   * @param {string} poker The room.
   * @param {Socket} client The client.
   *
   * @private
   */
  private removeFromNames(poker: string, client: Socket): void {
    if (this.names[poker]) {
      delete this.names[poker][client.id];
    }
  }

  /**
   * Remove client from votes.
   *
   * @param {string} poker The room.
   * @param {Socket} client The client.
   *
   * @private
   */
  private removeFromVotes(poker: string, client: Socket): void {
    if (this.votes[poker]) {
      delete this.votes[poker][client.id];
    }
  }

  /**
   * Remove client from room.
   *
   * @param {string} poker The room.
   * @param {Socket} client The client.
   *
   * @private
   */
  private removeFromPoker(poker: string, client: Socket): void {
    if (this.pokers[poker]) {
      const index = this.pokers[poker].indexOf(client);
      if (index !== -1) {
        this.pokers[poker].splice(index, 1);
      }
    }
  }

  /**
   * Retrieves the name of the client.
   *
   * @param {string} poker The room.
   * @param {string} clientId The client ID.
   *
   * @returns {string} The name of the client.
   * @private
   */
  private getClientName(poker: string, clientId: string): string {
    return this.names[poker][clientId] || 'Unknown';
  }

  /**
   * Retrieves the client IDs of the room clients.
   *
   * @param {string} poker The room.
   *
   * @returns {string[]} List of client IDs.
   *
   * @private
   */
  private getPokerClientIds(poker: string) {
    if (!this.votes[poker]) {
      return [];
    }

    return Object.keys(this.votes[poker]);
  }

  /**
   * Calculates the number of votes.
   *
   * @param {string} poker The room.
   *
   * @returns {number} Number of votes in the room.
   *
   * @private
   */
  private getVoteCount(poker: string) {
    const votes = this.getVotes(poker);
    return Object.keys(votes).length;
  }

  /**
   * Adds a vote to a room.
   *
   * @param {string} poker The room.
   * @param {Socket} client The client.
   * @param {string|number} vote The vote.
   *
   * @private
   */
  private addPokerVote(poker: string, client: Socket, vote): void {
    this.votes[poker] = this.votes[poker] || {};
    this.votes[poker][client.id] = vote;
  }

  /**
   * Lists the votes in a room.
   *
   * @param {string} poker The room.
   *
   * @returns {string[]} List of votes.
   *
   * @private
   */
  private getVotes(poker: string) {
    return this.votes[poker] || {};
  }

  /**
   * Sets all votes of a room.
   *
   * @param {string} poker The room.
   * @param {any} value The votes to set.
   *
   * @private
   */
  private setVotes(poker: string, value) {
    this.votes[poker] = value;
  }
}
