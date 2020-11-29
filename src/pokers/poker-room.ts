import { Socket } from 'socket.io';

export interface client {
  vote: number | string;
  name: string;
  id: string;
}

export interface story {
  name: string;
  result: number;
  votes: {
    vote: number | string;
    name: string;
  }[];
}

export interface room {
  clients: {
    [clientId: string]: client;
  };
  stories: story[];
  story: string;
}

export class PokerRoom {
  private room: room = { clients: {}, stories: [], story: '' };

  /**
   * Lists all names in a room.
   *
   * @returns {string[]} List of names.
   *
   * @private
   */
  public getNames(): string[] {
    return Object.values(this.room.clients).map(
      (client: client) => client.name,
    );
  }

  /**
   * Lists all poker clients.
   *
   * @returns {Socket[]} Clients.
   *
   * @private
   */
  public getClients(): client[] {
    return Object.values(this.room.clients);
  }

  /**
   * Adds a client to a room.
   *
   * @param {Socket} client The client.
   * @param {string} name The name.
   *
   * @private
   */
  public addClient(client: Socket, name: string): void {
    this.room.clients[client.id] = {
      id: client.id,
      name,
      vote: null,
    };
  }

  /**
   * Adds a name to a client.
   *
   * @param {Socket} client  The client.
   * @param {string} name The name.
   *
   * @private
   */
  public setClientName(client: Socket, name: string): void {
    this.room.clients[client.id].name = name;
  }

  /**
   * Remove client from room.
   *
   * @param {Socket} client The client.
   *
   * @private
   */
  public removeClient(client: Socket): void {
    delete this.room.clients[client.id];
  }

  /**
   * Retrieves the voted clients.
   *
   * @returns {client[]} List of voted clients.
   *
   * @private
   */
  public getVotedClients(): client[] {
    return Object.values(this.room.clients).filter(
      (client: client) => client.vote || client.vote === 0,
    );
  }

  /**
   * Adds a vote to a room.
   *
   * @param {Socket} client The client.
   * @param {string|number} vote The vote.
   *
   * @private
   */
  public addVote(client: Socket, vote: number | string): void {
    this.room.clients[client.id].vote = vote;
  }

  /**
   * Lists the votes in a room.
   *
   * @returns {string[]} List of votes.
   *
   * @private
   */
  public getVotes(): (number | string)[] {
    return Object.values(this.room.clients)
      .map((client: client): number | string => client.vote)
      .filter((vote: number | string) => vote || vote === 0);
  }

  /**
   * Starts a new story.
   *
   * @param {number} [result] Result of the current story.
   */
  public newStory(result?: number): void {
    if (result || result === 0) {
      this.addStory(result);
    }

    // Reset story name.
    this.room.story = '';

    this.resetVotes();
  }

  /**
   * Adds a story to the history.
   *
   * @param {result} result Result of the story.
   *
   * @private
   */
  private addStory(result: number) {
    const story: story = {
      name: this.room.story,
      result,
      votes: this.getVotedClients().map((client: client) => {
        return { name: client.name, vote: client.vote };
      }),
    };

    this.room.stories.push(story);
  }

  /**
   * Sets the story name.
   *
   * @param {string} name The name.
   */
  public setStoryName(name: string): void {
    this.room.story = name;
  }

  /**
   * Retrieves all stories for the room.
   *
   * @returns {story[]} The stories of the room.
   */
  public getStories(): story[] {
    return this.room.stories;
  }

  /**
   * Resets room stories history.
   */
  public resetHistory(): void {
    this.room.stories = [];
  }

  /**
   * Sets all votes of a room.
   *
   * @private
   */
  public resetVotes(): void {
    for (const clientId in this.room.clients) {
      this.room.clients[clientId].vote = null;
    }
  }
}
