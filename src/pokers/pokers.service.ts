import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';
import { PointsService } from '../points/points.service';
import { PokersRoomsService, client, story } from './pokers-rooms.service';

interface currentVotes {
  voteCount: number;
  votes: (number | string)[];
  voteNames: {
    [vote: string]: string[];
  };
}

@Injectable()
export class PokersService {
  constructor(private readonly pokersData: PokersRoomsService) {
  }

  /**
   * Lets a client join a room.
   *
   * @param {Socket} client The client.
   * @param {string} poker The room.
   * @param {string} name Client name.
   */
  public join(client: Socket, poker: string, name: string) {
    if (this.pokersData.roomHasClient(poker, client)) {
      return;
    }

    const useName = name || 'Unnamed' + Math.floor(Math.random() * 100000);
    this.pokersData.addClientToRoom(poker, client, useName);

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
    this.pokersData.removeFromRoom(poker, client);
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

    this.pokersData.setClientName(poker, client, name);
  }

  /**
   * Retrieves the names of all clients for a room.
   *
   * @param {string} poker The poker.
   */
  public getNames(poker: string) {
    return this.pokersData.getNames(poker);
  }

  /**
   * Retrieves all names of voted clients.
   *
   * @param {string} poker The room.
   */
  public getVotedNames(poker: string) {
    return this.pokersData
      .getVotedClients(poker)
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
    return this.pokersData.getClients(poker).length;
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
    if (this.getClientCount(poker) === this.pokersData.getVoteCount(poker)) {
      return;
    }

    // Prevent cheaters from entering bogus point totals.
    if (!PointsService.getPoints().includes(vote)) {
      return;
    }

    this.pokersData.addVote(poker, client, vote);
  }

  /**
   * Retrieves the votes for a room.
   *
   * @param {string} poker Room.
   *
   * @returns currentVotes Votes in that room. Obfuscated if not all votes are in yet.
   */
  public getVotes(poker: string): currentVotes {
    const voted = this.pokersData.getVotedClients(poker);
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
    this.pokersData.newStory(poker, result);
  }

  /**
   * Retrieves all stories.
   *
   * @param {string} poker The room.
   *
   * @returns {story[]} All stories.
   */
  public getStories(poker: string): story[] {
    return this.pokersData.getStories(poker);
  }

  /**
   * Resets room stories history.
   *
   * @param {string} poker The room.
   */
  public resetHistory(poker: string): void {
    this.pokersData.resetHistory(poker);
  }
}
