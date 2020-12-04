export interface Client {
  votes: Vote[];
  name: string;
  id: string;
}

export interface Story {
  name: string;
  voteAverage?: number | string;
  votes: Vote[];
}

export interface Vote {
  story: Story;
  voter: Client;
  currentValue: VoteValue;
  initialValue: VoteValue;
}

export interface HiddenVote extends Vote {
  currentValue: HiddenVoteValue;
  initialValue: HiddenVoteValue;
}

export type VoteValue =
  | 0
  | 0.5
  | 1
  | 2
  | 3
  | 5
  | 8
  | 13
  | 21
  | 100
  | 'coffee'
  | HiddenVoteValue;

export type HiddenVoteValue = '?' | 'X';

export class PokerRoom {
  private readonly clients: { [clientId: string]: Client };
  private readonly history: Story[];
  private currentStory: Story;

  constructor() {
    this.clients = {};
    this.history = [];
    this.currentStory = { name: '', votes: [] };
  }

  /**
   * Lists clients in a room.
   *
   * @returns {Client[]} List of clients.
   *
   * @private
   */
  public getClients(): Client[] {
    return Object.values(this.clients);
  }

  /**
   * Lists all poker clients.
   *
   * @returns {number} Number of clients.
   *
   * @private
   */
  public getClientCount(): number {
    return Object.values(this.clients).length;
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
    this.clients[userId] = {
      id: userId,
      name,
      votes: [],
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
    this.clients[userId].name = name;
  }

  /**
   * Remove client from room.
   *
   * @param {string} userId The user Id.
   *
   * @private
   */
  public removeClient(userId: string): void {
    delete this.clients[userId];
    // Remove client's current votes.
    this.currentStory.votes = this.currentStory.votes.filter(
      (vote: Vote) => vote.voter.id !== userId,
    );
    this.setStoryAverage(this.currentStory);
  }

  /**
   * Gets the client.
   *
   * @param {string} userId User Id.
   *
   * @returns {Client} The client.
   */
  public getClient(userId: string): Client {
    return this.clients[userId] || { id: '', name: '', votes: [] };
  }

  /**
   * Sets a client on a room.
   *
   * @param {string} userId The user Id.
   * @param {Client} client The client.
   */
  public restoreClient(userId: string, client: Client): void {
    this.clients[userId] = client;
  }

  /**
   * Retrieves the voted clients.
   *
   * @returns {Client[]} List of voted clients.
   *
   * @private
   */
  public getVotedClients(): Client[] {
    return Object.values(this.clients).filter((client: Client) =>
      client.votes.some((vote: Vote) => vote.story === this.currentStory),
    );
  }

  /**
   * Casts a vote for a user.
   *
   * @param {string} userId The user that votes.
   * @param {VoteValue} vote The vote.
   */
  public castVote(userId: string, vote: VoteValue): void {
    if (!this.getCurrentVote(userId)) {
      this.addVote(userId, vote);
      return;
    }
    this.changeVote(userId, vote);
  }

  /**
   * Adds a vote to the current story.
   *
   * @param {string} userId The user Id.
   * @param {VoteValue} voteValue The vote.
   *
   * @private
   */
  private addVote(userId: string, voteValue: VoteValue): void {
    const vote: Vote = {
      story: this.currentStory,
      voter: this.clients[userId],
      initialValue: voteValue,
      currentValue: voteValue,
    };
    this.clients[userId].votes.push(vote);
    this.currentStory.votes.push(vote);
    this.setStoryAverage(this.currentStory);
  }

  /**
   * Changes a user's vote for the current story.
   *
   * @param {string} userId The uer Id.
   * @param {VoteValue} vote The vote.
   */
  private changeVote(userId: string, vote: VoteValue): void {
    if (!this.everybodyVoted(this.currentStory)) {
      this.getCurrentVote(userId).initialValue = vote;
    }
    this.getCurrentVote(userId).currentValue = vote;
    this.setStoryAverage(this.currentStory);
  }

  private everybodyVoted(story: Story): boolean {
    return story.votes.length === Object.keys(this.clients).length;
  }

  /**
   * Gets the vote that a user has cast for the current
   * @param {string} userId
   * @returns {Vote}
   */
  public getCurrentVote(userId: string): Vote | undefined {
    return this.clients[userId].votes.find(
      (vote: Vote) => vote.story === this.currentStory,
    );
  }

  /**
   * Lists the votes in a room.
   *
   * @returns {Vote[]} List of votes.
   *
   * @private
   */
  public getVotes(): Vote[] {
    return this.currentStory.votes;
  }

  public getHiddenVotes(): Vote[] {
    return Object.values(this.clients).map(
      (client: Client): HiddenVote => {
        const hasVoted: boolean = this.getCurrentVote(client.id) !== undefined;
        const voteValue: HiddenVoteValue = hasVoted ? 'X' : '?';

        return {
          initialValue: voteValue,
          currentValue: voteValue,
          voter: client,
          story: this.currentStory,
        };
      },
    );
  }

  /**
   * Reset all votes for the current story.
   *
   * @private
   */
  public resetVotes(): void {
    // Remove votes from userVotes.
    for (const clientId of Object.keys(this.clients)) {
      this.clients[clientId].votes = this.clients[clientId].votes.filter(
        (vote: Vote) => vote.story === this.currentStory,
      );
    }
    // Remove votes from the current story.
    this.currentStory.votes = [];
    this.setStoryAverage(this.currentStory);
  }

  public setStoryAverage(story: Story): void {
    if (story.votes.length === 0) {
      delete story.voteAverage;
      return;
    }
    if (story.votes.some((vote: Vote) => vote.currentValue === 'coffee')) {
      story.voteAverage = 'coffee';
      return;
    }

    const valueIsHidden = story.votes.some(
      (vote: Vote) => vote.currentValue === 'X' || vote.currentValue === '?',
    );
    if (valueIsHidden) {
      story.voteAverage = 'unknown';
      return;
    }

    const pointTotal = story.votes.reduce<number>(
      (accumulator: number, vote: Vote) =>
        accumulator + (vote.currentValue as number),
      0,
    );
    story.voteAverage = Math.fround(pointTotal / story.votes.length);
  }

  /**
   * Starts a new story.
   *
   * @param {string=} name The name of the new story.
   */
  public newStory(name = ''): void {
    // Save the current story to the history.
    this.history.push(this.currentStory);

    // Reset the current story.
    this.currentStory = { name, votes: [] };
  }

  /**
   * Sets the story name.
   *
   * @param {string} name The name.
   */
  public setStoryName(name: string): void {
    this.currentStory.name = name;
  }

  /**
   * Gets the current story.
   */
  public getCurrentStory(): Story {
    return this.currentStory;
  }

  /**
   * Retrieves all stories for the room.
   *
   * @returns {Story[]} The stories of the room.
   */
  public getHistory(): Story[] {
    return this.history;
  }

  /**
   * Resets stories history.
   */
  public resetHistory(): void {
    this.history.splice(0, this.history.length);
  }

  /**
   * Removes the last history item.
   */
  public popHistory(): void {
    this.history.pop();
  }
}
