import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

export interface client {
  vote: number | string;
  name: string;
  id: string;
}

export interface story {
  result: number;
  votes: {
    vote: number | string;
    name: string;
  }[];
  timestamp: number;
}

export interface room {
  clients: {
    [clientId: string]: client;
  };
  stories: story[];
}

export interface rooms {
  [key: string]: room[];
}

@Injectable()
export class PokersRoomsService {
  rooms: rooms[] = [];

  /**
   * Lists all names in a room.
   *
   * @param {string} poker The room.
   *
   * @returns {string[]} List of names.
   *
   * @private
   */
  public getNames(poker: string): string[] {
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
  public getClients(poker: string): client[] {
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
  public addClientToRoom(poker: string, client: Socket, name: string): void {
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
  public roomHasClient(poker: string, client: Socket): boolean {
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
  public getRoom(poker: string): room {
    return this.rooms[poker] || { clients: [], stories: [] };
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
  public setClientName(poker: string, client: Socket, name: string): void {
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
  public removeFromRoom(poker: string, client: Socket): void {
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
  public getVotedClients(poker: string): client[] {
    return Object.values(this.getRoom(poker).clients).filter(
      (client: client) => client.vote || client.vote === 0,
    );
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
  public getVoteCount(poker: string): number {
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
  public addVote(poker: string, client: Socket, vote: number | string): void {
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
  public getVotes(poker: string): (number | string)[] {
    return Object.values(this.getRoom(poker).clients)
      .map((client: client): number | string => client.vote)
      .filter((vote: number | string) => vote || vote === 0);
  }

  /**
   * Starts a new story.
   *
   * @param {string} poker The room.
   * @param {number} [result] Result of the current story.
   */
  public newStory(poker: string, result?: number): void {
    if (result || result === 0) {
      this.addStory(poker, result);
    }

    this.resetVotes(poker);
  }

  /**
   * Adds a story to the history.
   *
   * @param {string} poker The room.
   * @param {result} result Result of the story.
   *
   * @private
   */
  private addStory(poker: string, result: number) {
    const story: story = {
      result,
      votes: this.getVotedClients(poker).map((client: client) => {
        return { name: client.name, vote: client.vote };
      }),
      timestamp: new Date().getTime(),
    };

    this.rooms[poker].stories = this.rooms[poker].stories || [];
    this.rooms[poker].stories.push(story);
  }

  /**
   * Retrieves all stories for the room.
   *
   * @param {string} poker The room.
   *
   * @returns {story[]} The stories of the room.
   */
  public getStories(poker: string): story[] {
    return this.getRoom(poker).stories;
  }

  /**
   * Resets room stories history.
   *
   * @param {string} poker The room.
   */
  public resetHistory(poker: string): void {
    this.rooms[poker].stories = [];
  }

  /**
   * Sets all votes of a room.
   *
   * @param {string} poker The room.
   *
   * @private
   */
  public resetVotes(poker: string): void {
    for (const clientId in this.rooms[poker].clients) {
      this.rooms[poker].clients[clientId].vote = null;
    }
  }
}
