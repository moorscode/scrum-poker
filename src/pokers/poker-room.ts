import { PointsService, PointValue } from "../points/points.service";

export type HiddenVoteValue = "?" | "X";
export type VoteValue = PointValue | HiddenVoteValue;

export interface Client {
	// eslint-disable-next-line no-use-before-define
	votes: Vote[];
	name: string;
	id: string;
}

export interface Story {
	name: string;
	voteAverage?: number | string;
	nearestPointAverage?: VoteValue;
	// eslint-disable-next-line no-use-before-define
	votes: Vote[];
	votesRevealed: boolean;
}

export interface Vote {
	story: Story;
	voter: Client;
	currentValue: VoteValue;
	initialValue: VoteValue;
}

export interface MemberList {
	voters: {
		[ clientId: string ]: Client;
	};
	observers: {
		[ clientId: string ]: Client;
	};
	disconnected: {
		[ clientId: string ]: Client;
	};
}

export interface ObscuredVote extends Vote {
	currentValue: HiddenVoteValue;
	initialValue: HiddenVoteValue;
}

/**
 * Poker Room
 */
export class PokerRoom {
	private readonly clients: MemberList;
	private readonly history: Story[];
	private currentStory: Story;

	/**
	 * Poker room constructor.
	 *
	 * Creates the empty objects.
	 */
	constructor() {
		this.clients      = { disconnected: {}, observers: {}, voters: {} };
		this.history      = [];
		this.currentStory = { name: "", votes: [], votesRevealed: false };
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {MemberList[]} List of clients.
	 *
	 * @private
	 */
	public getClients(): MemberList {
		return this.clients;
	}

	/**
	 * Lists all poker voters.
	 *
	 * @returns {number} Number of voters.
	 *
	 * @private
	 */
	public getVotersCount(): number {
		return Object.values( this.clients.voters ).length;
	}

	/**
	 * Retrieves the total client count.
	 *
	 * @returns {number} The total number of clients connected.
	 */
	public getClientCount(): number {
		return (
			Object.values( this.clients.voters ).length +
			Object.values( this.clients.observers ).length +
			Object.values( this.clients.disconnected ).length
		);
	}

	/**
	 * Adds a client to a room.
	 *
	 * @param {string} userId The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public addClient( userId: string, name: string ): void {
		if ( this.clients.observers[ userId ] ) {
			delete this.clients.observers[ userId ];
		}

		if ( this.clients.disconnected[ userId ] ) {
			this.clients.voters[ userId ] = this.clients.disconnected[ userId ];
			delete this.clients.disconnected[ userId ];
		}

		this.currentStory.votesRevealed = false;

		this.clients.voters[ userId ] = {
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
	 * @returns {void}
	 *
	 * @private
	 */
	public setClientName( userId: string, name: string ): void {
		if ( this.clients.voters[ userId ] ) {
			this.clients.voters[ userId ].name = name;
		}
		if ( this.clients.observers[ userId ] ) {
			this.clients.observers[ userId ].name = name;
		}
	}

	/**
	 * Remove client from room.
	 *
	 * @param {string} userId The user Id.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public removeClient( userId: string ): void {
		delete this.clients.voters[ userId ];
		delete this.clients.disconnected[ userId ];
		delete this.clients.observers[ userId ];

		// Remove client's current votes.
		this.currentStory.votes = this.currentStory.votes.filter(
			( vote: Vote ) => vote.voter.id !== userId,
		);
		this.setStoryAverage( this.currentStory );
		this.currentStory.votesRevealed = false;
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} userId The user.
	 *
	 * @returns {void}
	 */
	public setObserver( userId: string ): void {
		if ( this.clients.voters[ userId ] ) {
			this.clients.observers[ userId ] = this.clients.voters[ userId ];
			delete this.clients.voters[ userId ];
		}

		delete this.clients.disconnected[ userId ];
		this.currentStory.votesRevealed = false;
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} userId The user.
	 *
	 * @returns {void}
	 */
	public setDisconnected( userId: string ): void {
		if ( this.clients.voters[ userId ] ) {
			this.clients.disconnected[ userId ] = this.clients.voters[ userId ];
			delete this.clients.voters[ userId ];
		}

		if ( this.clients.observers[ userId ] ) {
			this.clients.disconnected[ userId ] = this.clients.observers[ userId ];
			delete this.clients.observers[ userId ];
		}
	}

	/**
	 * Retrieves the voted voters.
	 *
	 * @returns {Client[]} List of voted voters.
	 */
	public getVotedClients(): Client[] {
		return Object.values( this.clients.voters ).filter( ( client: Client ) =>
			client.votes.some( ( vote: Vote ) => vote.story === this.currentStory ),
		);
	}

	/**
	 * Retrieves the voters that haven't voted yet.
	 *
	 * @returns {Client[]} List of voters that haven't voted yet.
	 */
	public getVotePendingClients(): Client[] {
		return Object.values( this.clients.voters ).filter( ( client: Client ) =>
			! client.votes.some( ( vote: Vote ) => vote.story === this.currentStory ),
		);
	}

	/**
	 * Casts a vote for a user.
	 *
	 * @param {string} userId The user that votes.
	 * @param {VoteValue} vote The vote.
	 *
	 * @returns {void}
	 */
	public castVote( userId: string, vote: VoteValue ): void {
		if ( ! this.getCurrentVote( userId ) ) {
			this.addVote( userId, vote );
			return;
		}
		this.changeVote( userId, vote );
	}

	/**
	 * Adds a vote to the current story.
	 *
	 * @param {string} userId The user Id.
	 * @param {VoteValue} voteValue The vote.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private addVote( userId: string, voteValue: VoteValue ): void {
		const vote: Vote = {
			story: this.currentStory,
			voter: this.clients.voters[ userId ],
			initialValue: voteValue,
			currentValue: voteValue,
		};
		this.clients.voters[ userId ].votes.push( vote );
		this.currentStory.votes.push( vote );
		this.setStoryAverage( this.currentStory );
	}

	/**
	 * Changes a user's vote for the current story.
	 *
	 * @param {string} userId The uer Id.
	 * @param {VoteValue} vote The vote.
	 *
	 * @returns {void}
	 */
	private changeVote( userId: string, vote: VoteValue ): void {
		if ( ! this.hasEverybodyVoted( this.currentStory ) ) {
			this.getCurrentVote( userId ).initialValue = vote;
		}
		if ( this.getCurrentVote( userId ).initialValue === "coffee" ) {
			this.getCurrentVote( userId ).initialValue = vote;
		}
		this.getCurrentVote( userId ).currentValue = vote;
		this.setStoryAverage( this.currentStory );
	}

	/**
	 * Checks if everybody has voted.
	 *
	 * @param {Story} story The story.
	 *
	 * @returns {boolean} True if every client has voted.
	 */
	private hasEverybodyVoted( story: Story ): boolean {
		return story.votes.length === this.getVotersCount();
	}

	/**
	 * Gets the vote that a user has cast for the current
	 *
	 * @param {string} userId The ID of the user.
	 *
	 * @returns {Vote} The vote of the user.
	 */
	public getCurrentVote( userId: string ): Vote | undefined {
		return this.clients.voters[ userId ].votes.find(
			( vote: Vote ) => vote.story === this.currentStory,
		);
	}

	/**
	 * Lists the votes in a room for the current story.
	 *
	 * @returns {Vote[]} List of votes.
	 */
	public getCurrentVotes(): Vote[] {
		if ( this.hasEverybodyVoted( this.currentStory ) || this.currentStory.votesRevealed ) {
			return this.getUnobscuredVotes( this.currentStory );
		}
		return this.getObscuredVotes( this.currentStory );
	}

	/**
	 * Gets all casted votes and backfills the missing votes with "?".
	 *
	 * @param {Story} story The story to get votes for.
	 *
	 * @returns {Vote[]} The actual votes with the backfilled missing votes.
	 */
	public getUnobscuredVotes( story: Story ): Vote[] {
		const notVotedClients:Client[] = this.getVotePendingClients();
		return [
			// The actual votes.
			...story.votes,
			// Backfill pending votes with obscured '?' votes.
			...notVotedClients.map(
				( client: Client ): ObscuredVote => this.getObscuredVote( this.currentStory, client ),
			),
		];
	}

	/**
	 * Retrieves the obscured votes.
	 *
	 * @param {Story} story The story to get obscured votes for.
	 *
	 * @returns {ObscuredVote[]} List of obscured votes.
	 */
	public getObscuredVotes( story: Story ): ObscuredVote[] {
		return Object.values( this.clients.voters ).map(
			( client: Client ): ObscuredVote =>  this.getObscuredVote( story, client ),
		).sort( ( a, b ) => {
			if ( a.currentValue === b.currentValue ) {
				return 0;
			}
			return a.currentValue === "X" ? -1 : 1;
		} );
	}

	/**
	 * Gets an obscured vote representing an hidden cast vote ("X") or a missing vote ("?").
	 *
	 * @param {Story} story The story to get the obscured vote for.
	 * @param {Client} client The client to get the obscured vote for.
	 *
	 * @returns {ObscuredVote} The obscured vote representing an hidden cast vote ("X") or a missing vote ("?").
	 */
	public getObscuredVote( story: Story, client: Client ): ObscuredVote {
		const hasVoted: boolean = typeof( this.getCurrentVote( client.id ) ) !== "undefined";
		const voteValue: HiddenVoteValue = hasVoted ? "X" : "?";
		return {
			initialValue: voteValue,
			currentValue: voteValue,
			voter: client,
			story: this.currentStory,
		};
	}

	/**
	 * Calculates and sets the story average value.
	 *
	 * @param {Story} story The story.
	 *
	 * @returns {void}
	 */
	public setStoryAverage( story: Story ): void {
		if ( story.votes.length === 0 ) {
			delete story.voteAverage;
			return;
		}
		if ( story.votes.some( ( vote: Vote ) => vote.currentValue === "coffee" ) ) {
			story.voteAverage         = "coffee";
			story.nearestPointAverage = "coffee";
			return;
		}

		const valueIsHidden = story.votes.some(
			( vote: Vote ) => vote.currentValue === "X" || vote.currentValue === "?",
		);
		if ( valueIsHidden ) {
			story.voteAverage         = "unknown";
			story.nearestPointAverage = "?";
			return;
		}

		const pointTotal  = story.votes.reduce<number>(
			( accumulator: number, vote: Vote ) =>
				accumulator + ( vote.currentValue as number ),
			0,
		);
		story.voteAverage = Math.fround( pointTotal / story.votes.length );

		// Find the nearest available point. Always round up.
		for ( const availablePoint of PointsService.getNumericPoints() ) {
			if ( story.voteAverage - availablePoint <= 0 ) {
				story.nearestPointAverage = availablePoint as PointValue;
				break;
			}
		}
	}

	/**
	 * Starts a new story.
	 *
	 * @param {string=} name The name of the new story.
	 *
	 * @returns {void}
	 */
	public newStory( name = "" ): void {
		// Save the current story to the history.
		this.history.push( this.currentStory );

		// Reset the current story.
		this.currentStory = { name, votes: [], votesRevealed: false };
	}

	/**
	 * Sets the storyName name.
	 *
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 */
	public setStoryName( name: string ): void {
		this.currentStory.name = name;
	}

	/**
	 * Gets the current story.
	 *
	 * @returns {Story} The current story.
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
	 *
	 * @returns {void}
	 */
	public resetHistory(): void {
		this.history.splice( 0, this.history.length );
	}

	/**
	 * Removes the last history item.
	 *
	 * @returns {void}
	 */
	public popHistory(): void {
		this.history.pop();
	}

	/**
	 * Toggles between showing and or hiding the current votes.
	 *
	 * @returns {boolean} The new value
	 */
	public toggleRevealVotes(): boolean {
		this.currentStory.votesRevealed = ! this.currentStory.votesRevealed;
		return this.currentStory.votesRevealed;
	}
}
