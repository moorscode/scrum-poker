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
  room: room = { clients: {}, stories: [], story: '' };

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
   * @returns {number} Number of clients.
   *
   * @private
   */
  public getClientCount(): number {
    return Object.values(this.room.clients).length;
  }

  /**
   * Adds a client to a room.
   *
   * @param {string} userId The user Id.
   * @param {string} name The name.
   *
   * @private
   */
  public addClient(userId: string, name: string): void {
    this.room.clients[userId] = {
      id: userId,
      name,
      vote: this.getClient(userId).vote,
    };
  }

  /**
   * Adds a name to a client.
   *
   * @param {string} userId The user Id.
   * @param {string} name The name.
   *
   * @private
   */
  public setClientName(userId: string, name: string): void {
    this.room.clients[userId].name = name;
  }

  /**
   * Remove client from room.
   *
   * @param {string} userId The user Id.
   *
   * @private
   */
  public removeClient(userId: string): void {
    delete this.room.clients[userId];
  }

  /**
   * Gets the client.
   *
   * @param {string} userId User Id.
   *
   * @returns {client} The client.
   */
  public getClient(userId: string): client {
    return this.room.clients[userId] || { id: '', name: '', vote: null };
  }

  /**
   * Sets a client on a room.
   *
   * @param {string} userId The user Id.
   * @param {client} client The client.
   */
  public restoreClient(userId: string, client: client): void {
    this.room.clients[userId] = client;
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
   * @param {string} userId The user Id.
   * @param {string|number} vote The vote.
   *
   * @private
   */
  public addVote(userId: string, vote: number | string): void {
    this.room.clients[userId].vote = vote;
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
   * Gets the story name.
   */
  public getStoryName(): string {
    return this.room.story;
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
   * Removes the last history item.
   */
  public popHistory(): void {
    this.room.stories.pop();
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
