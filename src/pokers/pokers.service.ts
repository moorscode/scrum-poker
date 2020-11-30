import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PointsService } from '../points/points.service';
import { PokerRoom, client, story } from './poker-room';

interface currentVotes {
  voteCount: number;
  votes: (number | string)[];
  voteNames: {
    [vote: string]: string[];
  };
}

export interface rooms {
  [room: string]: PokerRoom;
}

export interface users {
  [socketId: string]: string;
}

export interface disconnected {
  [userId: string]: {
    room: string;
    client: client;
  };
}

@Injectable()
export class PokersService {
  private rooms: rooms = {};
  private users: users = {};
  private disconnected: disconnected = {};

  /**
   * Returns debug information.
   *
   * @returns {any} Debug info.
   */
  public debug() {
    return this.rooms;
  }

  /**
   * Greets a new user.
   *
   * @param {Socket} client The client socket.
   * @param {string} userId The user Id.
   */
  public greet(client: Socket, userId: string): void {
    this.users[client.id] = userId;

    // Try to restore a user.
    if (this.disconnected[userId]) {
      const restore = this.disconnected[userId];
      this.rooms[restore.room].restoreClient(userId, restore.client);

      delete this.disconnected[userId];
    }
  }

  public getVote(client: Socket, room: string) {
    return this.getRoom(room).getClient(this.getUserId(client)).vote;
  }

  /**
   * Lets the client leave.
   *
   * @param {Socket} client The client.
   */
  public exit(client: Socket): void {
    const userId = this.users[client.id];

    this.removeUserFromRooms(userId);

    for (const socketId in this.users) {
      if (this.users[socketId] === userId) {
        delete this.users[socketId];
      }
    }
  }

  /**
   * Disconnects a client, stores data for reconnection.
   *
   * @param {Socket} client Disconnecting client.
   * @param {string} room The room of the user.
   */
  public disconnect(client: Socket, room: string): void {
    const userId = this.getUserId(client);

    // Store to restore on reconnect.
    this.disconnected[userId] = {
      room,
      client: this.getRoom(room).getClient(userId),
    };

    this.rooms[room] = this.getRoom(room);
    this.rooms[room].removeClient(userId);
  }

  /**
   * Removes a user from their rooms.
   *
   * @param {string} userId The user Id.
   *
   * @private
   */
  private removeUserFromRooms(userId: string): void {
    for (const room in this.rooms) {
      this.rooms[room].removeClient(userId);
    }
  }

  /**
   * Retrieves a user Id for a client.
   *
   * @param {Socket} client The client
   *
   * @returns {string} The user Id.
   *
   * @private
   */
  private getUserId(client: Socket): string {
    return this.users[client.id];
  }

  /**
   * Lets a client join a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   * @param {string} name Client name.
   */
  public join(client: Socket, poker: string, name: string): void {
    const useName = name || 'Unnamed' + Math.floor(Math.random() * 100000);

    client.join(poker);

    this.rooms[poker] = this.getRoom(poker);
    this.rooms[poker].addClient(this.getUserId(client), useName);
  }

  /**
   * Retrieves the room.
   *
   * @param {string} poker Room to get.
   *
   * @returns {PokerRoom} The room.
   *
   * @private
   */
  private getRoom(poker: string): PokerRoom {
    return this.rooms[poker] || new PokerRoom();
  }

  /**
   * Lets a client leave a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  public leave(client: Socket, poker: string): void {
    this.observe(client, poker);

    if (this.getRoom(poker).getClientCount() === 0) {
      delete this.rooms[poker];
    }

    client.leave(poker);
  }

  /**
   * Removes the client from the room and votes lists.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   */
  public observe(client: Socket, poker: string) {
    this.getRoom(poker).removeClient(this.getUserId(client));
  }

  /**
   * Set a name for a client.
   *
   * @param {string} poker The poker.
   * @param {Socket} client The client.
   * @param {string} name The name.
   */
  public setName(poker: string, client: Socket, name: string) {
    if (!name) return;

    this.getRoom(poker).setClientName(this.getUserId(client), name);
  }

  /**
   * Retrieves the names of all clients for a room.
   *
   * @param {string} poker The poker.
   */
  public getNames(poker: string) {
    return this.getRoom(poker).getNames();
  }

  /**
   * Retrieves all names of voted clients.
   *
   * @param {string} poker The room.
   */
  public getVotedNames(poker: string) {
    return this.getRoom(poker)
      .getVotedClients()
      .map((client: client) => client.name);
  }

  /**
   * Retrieves the number of members in a room.
   *
   * @param {string} poker The room.
   *
   * @returns {number} Number of members in the room.
   */
  public getClientCount(poker: string) {
    return this.getRoom(poker).getClientCount();
  }

  /**
   * Registers a vote for a client in a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   * @param {number|string} vote The vote.
   */
  public vote(client: Socket, poker: string, vote): void {
    const votedCount = this.getRoom(poker).getVotedClients().length;
    // If everybody has voted, don't allow any changes until reset.
    if (this.getClientCount(poker) === votedCount) {
      return;
    }

    // Prevent cheaters from entering bogus point totals.
    if (!PointsService.getPoints().includes(vote)) {
      return;
    }

    this.getRoom(poker).addVote(this.getUserId(client), vote);
  }

  /**
   * Retrieves the votes for a room.
   *
   * @param {string} poker Room.
   *
   * @returns currentVotes Votes in that room. Obfuscated if not all votes are in yet.
   */
  public getVotes(poker: string): currentVotes {
    const voted = this.getRoom(poker).getVotedClients();
    const votes = voted.map((client: client) => client.vote);

    const voteCount = votes.length;
    const memberCount = this.getClientCount(poker);

    // When all votes are in, show the actual votes.
    if (memberCount === voteCount) {
      return {
        voteCount: votes.length,
        votes,
        voteNames: voted.reduce((accumulator, client: client) => {
          accumulator[client.vote] = accumulator[client.vote] || [];
          accumulator[client.vote].push(client.name);
          return accumulator;
        }, {}),
      };
    }

    // Otherwise show an X for voted, ? for unvoted.
    return {
      voteCount,
      votes: Array(memberCount)
        .fill('X', 0, voteCount)
        .fill('?', voteCount, memberCount),
      voteNames: {},
    };
  }

  /**
   * Resets the votes for a room.
   *
   * @param {string} poker Room to reset.
   * @param {number} [result] Result of the current story.
   */
  public newStory(poker: string, result?: number): void {
    this.getRoom(poker).newStory(result);
  }

  /**
   * Sets the story name.
   *
   * @param {string} poker Room to set to.
   * @param {string} name Name of the story.
   */
  public setStoryName(poker: string, name: string): void {
    this.getRoom(poker).setStoryName(name);
  }

  /**
   * Gets the story name.
   *
   * @param {string} poker The room.
   *
   * @returns {string} The story name.
   */
  public getStoryName(poker: string): string {
    return this.getRoom(poker).getStoryName();
  }

  /**
   * Retrieves all stories.
   *
   * @param {string} poker The room.
   *
   * @returns {story[]} All stories.
   */
  public getStories(poker: string): story[] {
    return this.getRoom(poker).getStories();
  }

  /**
   * Removes the last history item.
   *
   * @param {string} poker The room.
   */
  public popHistory(poker: string): void {
    this.getRoom(poker).popHistory();
  }

  /**
   * Resets room stories history.
   *
   * @param {string} poker The room.
   */
  public resetHistory(poker: string): void {
    this.getRoom(poker).resetHistory();
  }
}
