import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PointsService } from '../points/points.service';

interface currentVotes {
  voteCount: number;
  votes: string[];
}

interface client {
  vote: any;
  name: string;
  id: string;
}

interface room {
  clients: {
    [clientId: string]: client;
  };
}

interface rooms {
  [key: string]: room[];
}

@Injectable()
export class PokersService {
  rooms: rooms[] = [];

  /**
   * Lets a client join a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   * @param {string} name Client name.
   */
  public join(client: Socket, poker: string, name: string) {
    if (this.pokerHasClient(poker, client)) {
      return;
    }

    const useName = name || 'Unnamed' + Math.floor(Math.random() * 100000);
    this.addClientToPoker(poker, client, useName);

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

    this.setClientName(poker, client, name);
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

    return this.getVotedClients(poker).map((client: client) => client.name);
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
    const votes = this.getVotedClients(poker)
      .map((client: client) => client.vote);

    const voteCount = votes.length;
    const memberCount = this.getMemberCount(poker);

    // When all votes are in, show the actual votes.
    if (memberCount === voteCount) {
      return {
        voteCount: votes.length,
        votes,
      };
    }

    // Otherwise show an X for voted, ? for unvoted.
    return {
      voteCount,
      votes: Array(memberCount)
        .fill('X', 0, voteCount)
        .fill('?', voteCount, memberCount),
    };
  }

  /**
   * Resets the votes for a room.
   *
   * @param {string} poker Room to reset.
   */
  public resetVotes(poker: string): void {
    this.resetRoomVotes(poker);
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
    return Object.values(this.getRoom(poker).clients).map(
      (client: client) => client.name,
    );
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
  private getPokerClients(poker: string): client[] {
    return Object.values(this.getRoom(poker).clients);
  }

  /**
   * Adds a client to a room.
   *
   * @param {string} poker The room.
   * @param {Socket} client The client.
   * @param {string} name The name.
   *
   * @private
   */
  private addClientToPoker(poker: string, client: Socket, name: string): void {
    this.rooms[poker] = this.rooms[poker] || { clients: {} };
    this.rooms[poker].clients[client.id] = { id: client.id, name };
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
    return !!this.getRoom(poker).clients[client.id];
  }

  /**
   * Retrieves a room.
   *
   * @param {string} poker Room to retrieve.
   *
   * @returns {room} The room.
   *
   * @private
   */
  private getRoom(poker: string): room {
    return this.rooms[poker] || { clients: [] };
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
  private setClientName(poker: string, client: Socket, name: string): void {
    this.getRoom(poker).clients[client.id].name = name;
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
    if (!this.rooms[poker]) {
      return;
    }

    delete this.rooms[poker].clients[client.id];

    // Remove the room if empty.
    if (this.rooms[poker].clients === {}) {
      delete this.rooms[poker];
    }
  }

  /**
   * Retrieves the voted clients.
   *
   * @param {string} poker The room.
   *
   * @returns {client[]} List of voted clients.
   *
   * @private
   */
  private getVotedClients(poker: string): client[] {
    return Object.values(this.getRoom(poker).clients)
      .filter((client: client) => !!client.vote);
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
  private getVoteCount(poker: string): number {
    return this.getVotedClients(poker).length;
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
    this.rooms[poker].clients[client.id].vote = vote;
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
  private getVotes(poker: string): string[] {
    return Object.values(this.getRoom(poker).clients)
      .map((client: client) => client.vote)
      .filter((vote) => vote);
  }

  /**
   * Sets all votes of a room.
   *
   * @param {string} poker The room.
   *
   * @private
   */
  private resetRoomVotes(poker: string): void {
    for (const clientId in this.rooms[poker].clients) {
      this.rooms[poker].clients[clientId].vote = null;
    }
  }
}
