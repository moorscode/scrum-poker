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
  voters: {
    [clientId: string]: client;
  };
  observers: {
    [clientId: string]: client;
  };
  disconnected: {
    [clientId: string]: client;
  };
  stories: story[];
  storyName: string;
}

export class PokerRoom {
  room: room = {
    voters: {},
    observers: {},
    disconnected: {},
    stories: [],
    storyName: '',
  };

  /**
   * Lists all voter in a room.
   *
   * @returns {string[]} List of names.
   *
   * @private
   */
  public getClientNames() {
    return {
      voters: Object.values(this.room.voters).map(
        (client: client) => client && client.name,
      ),
      observers: Object.values(this.room.observers).map(
        (client: client) => client && client.name,
      ),
      disconnected: Object.values(this.room.disconnected).map(
        (client: client) => client && client.name,
      ),
    };
  }

  /**
   * Lists all voter in a room.
   *
   * @returns {string[]} List of names.
   *
   * @private
   */
  public getVoterNames(): string[] {
    return Object.values(this.room.voters).map((client: client) => client.name);
  }

  /**
   * Lists all poker voters.
   *
   * @returns {number} Number of voters.
   *
   * @private
   */
  public getVotersCount(): number {
    return Object.values(this.room.voters).length;
  }

  public getClientCount(): number {
    return (
      Object.values(this.room.voters).length +
      Object.values(this.room.observers).length +
      Object.values(this.room.disconnected).length
    );
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
    if (this.room.observers[userId]) {
      delete this.room.observers[userId];
    }

    if (this.room.disconnected[userId]) {
      this.room.voters[userId] = this.room.disconnected[userId];
      delete this.room.disconnected[userId];
    }

    this.room.voters[userId] = {
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
    if (this.room.voters[userId]) {
      this.room.voters[userId].name = name;
    }
    if (this.room.observers[userId]) {
      this.room.observers[userId].name = name;
    }
  }

  /**
   * Remove client from room.
   *
   * @param {string} userId The user Id.
   *
   * @private
   */
  public removeClient(userId: string): void {
    delete this.room.voters[userId];
    delete this.room.disconnected[userId];
    delete this.room.observers[userId];
  }

  /**
   * Sets a user as an observer.
   *
   * @param {string} userId The user.
   */
  public setObserver(userId: string): void {
    if (this.room.voters[userId]) {
      this.room.observers[userId] = this.room.voters[userId];
      delete this.room.voters[userId];
    }

    delete this.room.disconnected[userId];
  }

  /**
   * Sets a user as an observer.
   *
   * @param {string} userId The user.
   */
  public setDisconnected(userId: string): void {
    if (this.room.voters[userId]) {
      this.room.disconnected[userId] = this.room.voters[userId];
      delete this.room.voters[userId];
    }

    if (this.room.observers[userId]) {
      this.room.disconnected[userId] = this.room.observers[userId];
      delete this.room.observers[userId];
    }
  }

  /**
   * Gets the client.
   *
   * @param {string} userId User Id.
   *
   * @returns {client} The client.
   */
  public getClient(userId: string): client {
    return this.room.voters[userId] || { id: '', name: '', vote: null };
  }

  /**
   * Retrieves the voted voters.
   *
   * @returns {client[]} List of voted voters.
   *
   * @private
   */
  public getVotedClients(): client[] {
    return Object.values(this.room.voters).filter(
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
    this.room.voters[userId].vote = vote;
  }

  /**
   * Lists the votes in a room.
   *
   * @returns {string[]} List of votes.
   *
   * @private
   */
  public getVotes(): (number | string)[] {
    return Object.values(this.room.voters)
      .map((client: client): number | string => client.vote)
      .filter((vote: number | string) => vote || vote === 0);
  }

  /**
   * Starts a new storyName.
   *
   * @param {number} [result] Result of the current storyName.
   */
  public newStory(result?: number): void {
    if (result || result === 0) {
      this.addStory(result);
    }

    // Reset storyName name.
    this.room.storyName = '';

    this.resetVotes();
  }

  /**
   * Adds a storyName to the history.
   *
   * @param {result} result Result of the storyName.
   *
   * @private
   */
  private addStory(result: number) {
    const story: story = {
      name: this.room.storyName,
      result,
      votes: this.getVotedClients().map((client: client) => {
        return { name: client.name, vote: client.vote };
      }),
    };

    this.room.stories.push(story);
  }

  /**
   * Sets the storyName name.
   *
   * @param {string} name The name.
   */
  public setStoryName(name: string): void {
    this.room.storyName = name;
  }

  /**
   * Gets the storyName name.
   */
  public getStoryName(): string {
    return this.room.storyName;
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
    for (const clientId in this.room.voters) {
      this.room.voters[clientId].vote = null;
    }
  }
}
