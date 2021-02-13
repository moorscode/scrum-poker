import { PointsService, PointValue } from "../points/points.service";

export type ObscuredVoteValue = "#" | "!";
export type VoteValue = PointValue | ObscuredVoteValue;
export type MemberType = "voter" | "observer";

export interface Member {
	// eslint-disable-next-line no-use-before-define
	name: string;
	id: string;
	type: MemberType;
	connected: boolean;
}

export interface Story {
	name: string;
	voteAverage?: number | string;
	nearestPointAverage?: VoteValue;
	// eslint-disable-next-line no-use-before-define
	votes: Vote[];
	voters: number;
	votesRevealed: boolean;
}

export interface Vote {
	story: Story;
	voter: Member;
	currentValue: VoteValue;
	initialValue: VoteValue;
}

export interface MemberList {
	[ memberId: string ]: Member
}

export interface ObscuredVote extends Vote {
	currentValue: ObscuredVoteValue;
	initialValue: ObscuredVoteValue;
}

/**
 * Poker Room
 */
export class PokerRoom {
	private readonly members: MemberList;
	private readonly history: Story[];
	private currentStory: Story;

	/**
	 * Poker room constructor.
	 *
	 * Creates the empty objects.
	 */
	constructor() {
		this.members      = {};
		this.history      = [];
		this.currentStory = { name: "", votes: [], voters: 0, votesRevealed: false };
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {MemberList[]} List of clients.
	 *
	 * @private
	 */
	public getMembers(): MemberList {
		return this.members;
	}

	/**
	 * Lists voters in a room.
	 *
	 * @returns {Member[]} List of voters.
	 */
	public getVoters(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => member.type === "voter" && member.connected );
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {Member[]} List of observers.
	 */
	public getObservers(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => member.type === "observer" && member.connected );
	}

	/**
	 * Lists disconnected members in a room.
	 *
	 * @returns {Member[]} List of disconnected members.
	 */
	public getDisconnected(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => ! member.connected );
	}

	/**
	 * Lists all poker voters.
	 *
	 * @returns {number} Number of voters.
	 *
	 * @private
	 */
	public getVoterCount(): number {
		return this.getActiveMembers().length;
	}

	/**
	 * Lists the active members of the room.
	 *
	 * @returns {Member[]} List of active members.
	 */
	public getActiveMembers(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => member.type === "voter" && member.connected );
	}

	/**
	 * Retrieves the total client count.
	 *
	 * @param {boolean} includeDisconnected Take disconnected clients into account.
	 *
	 * @returns {number} The total number of clients connected.
	 */
	public getClientCount( includeDisconnected = true ): number {
		return Object.values( this.members ).filter( member => member.connected || includeDisconnected ).length;
	}

	/**
	 * Adds a client to a room.
	 *
	 * @param {string} memberId The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public addClient( memberId: string, name: string ): void {
		this.members[ memberId ] = {
			id: memberId,
			name,
			type: "voter",
			connected: true,
		};

		this.recalculateStory();
	}

	public recalculateStory() {
		this.currentStory = this.setStoryAverage( this.currentStory );
		this.currentStory.votesRevealed = false;
		this.currentStory.voters = this.getVoterCount();
	}

	/**
	 * Adds a name to a client.
	 *
	 * @param {string} memberId The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public setClientName( memberId: string, name: string ): void {
		this.members[ memberId ].name = name;
	}

	/**
	 * Removes a client from the room.
	 *
	 * @param {string} memberId The User ID.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public removeClient( memberId: string ): void {
		delete this.members[ memberId ];

		this.removeVote( memberId );
	}

	/**
	 * Removes a vote from a user.
	 *
	 * @param {string} memberId User ID to remove the vote of.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public removeVote( memberId: string ): void {
		// Remove client's current votes.
		this.currentStory.votes = this.currentStory.votes.filter(
			( vote: Vote ) => vote.voter.id !== memberId,
		);

		this.recalculateStory();
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} memberId The user.
	 *
	 * @returns {void}
	 */
	public makeObserver( memberId: string ): void {
		this.members[ memberId ].type = "observer";
		this.members[ memberId ].connected = true;

		this.removeVote( memberId );
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} memberId The user.
	 *
	 * @returns {void}
	 */
	public setDisconnected( memberId: string ): void {
		if ( this.members[ memberId ] ) {
			this.members[ memberId ].connected = false;
		}

		this.recalculateStory();
	}

	/**
	 * Retrieves the voted voters.
	 *
	 * @returns {Member[]} List of voted voters.
	 */
	public getVotedClients(): Member[] {
		return this.getActiveMembers()
			.filter( ( member: Member ) => this.currentStory.votes.map( ( vote: Vote ) => vote.voter.id ).includes( member.id ) );
	}

	/**
	 * Retrieves the voters that haven't voted yet.
	 *
	 * @returns {Member[]} List of voters that haven't voted yet.
	 */
	public getVotePendingClients(): Member[] {
		return this.getActiveMembers()
			.filter( ( member: Member ) => ! this.currentStory.votes.map( ( vote: Vote ) => vote.voter.id ).includes( member.id ) );
	}

	/**
	 * Casts a vote for a user.
	 *
	 * @param {string} memberId The user that votes.
	 * @param {VoteValue} vote The vote.
	 *
	 * @returns {void}
	 */
	public castVote( memberId: string, vote: VoteValue ): void {
		if ( ! this.getCurrentVote( memberId ) ) {
			this.addVote( memberId, vote );
			return;
		}
		this.changeVote( memberId, vote );
	}

	/**
	 * Adds a vote to the current story.
	 *
	 * @param {string} memberId The user Id.
	 * @param {VoteValue} voteValue The vote.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private addVote( memberId: string, voteValue: VoteValue ): void {
		const vote: Vote = {
			story: this.getCurrentStory(),
			voter: this.members[ memberId ],
			initialValue: voteValue,
			currentValue: voteValue,
		};

		this.currentStory.votes.push( vote );
		this.currentStory = this.setStoryAverage( this.currentStory );
	}

	/**
	 * Changes a user's vote for the current story.
	 *
	 * @param {string} memberId The uer Id.
	 * @param {VoteValue} vote The vote.
	 *
	 * @returns {void}
	 */
	private changeVote( memberId: string, vote: VoteValue ): void {
		if ( ! this.hasEverybodyVoted( this.currentStory ) ) {
			this.getCurrentVote( memberId ).initialValue = vote;
		}
		if ( this.getCurrentVote( memberId ).initialValue === "coffee" ) {
			this.getCurrentVote( memberId ).initialValue = vote;
		}
		this.getCurrentVote( memberId ).currentValue = vote;

		this.currentStory = this.setStoryAverage( this.currentStory );
	}

	/**
	 * Checks if everybody has voted.
	 *
	 * @param {Story} story The story.
	 *
	 * @returns {boolean} True if every client has voted.
	 */
	private hasAllVotes( story: Story ): boolean {
		return story.votes.length === this.getVoterCount();
	}

	/**
	 * Gets the vote that a user has cast for the current
	 *
	 * @param {string} memberId The ID of the user.
	 *
	 * @returns {Vote} The vote of the user.
	 */
	public getCurrentVote( memberId: string ): Vote | undefined {
		return this.currentStory.votes.filter( ( vote: Vote ) => vote.voter.id === memberId )[0];
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
		const notVotedClients:Member[] = this.getVotePendingClients();
		const notVoted = notVotedClients.map(
			( client: Member ): ObscuredVote => this.getObscuredVote( this.currentStory, client ),
		);

		return [
			// The actual votes.
			...story.votes,
			// Backfill pending votes with obscured votes.
			...notVoted,
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
		return this.getActiveMembers()
			.map( ( member: Member ): ObscuredVote => this.getObscuredVote( story, member ) )
			.sort( ( a, b ) => {
				if ( a.currentValue === b.currentValue ) {
					return 0;
				}
				return a.currentValue === "!" ? -1 : 1;
			} );
	}

	/**
	 * Gets an obscured vote representing an hidden cast vote ("X") or a missing vote ("?").
	 *
	 * @param {Story} story The story to get the obscured vote for.
	 * @param {Member} member The client to get the obscured vote for.
	 *
	 * @returns {ObscuredVote} The obscured vote representing an hidden cast vote ("X") or a missing vote ("?").
	 */
	public getObscuredVote( story: Story, member: Member ): ObscuredVote {
		const hasVoted: boolean = typeof( this.getCurrentVote( member.id ) ) !== "undefined";
		const voteValue: ObscuredVoteValue = hasVoted ? "!" : "#";

		return {
			initialValue: voteValue,
			currentValue: voteValue,
			voter: member,
			story: this.getCurrentStory(),
		};
	}

	/**
	 * Calculates and sets the story average value.
	 *
	 * @param {Story} story The story.
	 *
	 * @returns {Story} The adjusted story.
	 */
	public setStoryAverage( story: Story ): Story {
		if ( story.votes.length === 0 ) {
			delete story.voteAverage;
			delete story.nearestPointAverage;
			return story;
		}

		if ( story.votes.some( ( vote: Vote ) => vote.currentValue === "coffee" ) ) {
			story.voteAverage         = "coffee";
			story.nearestPointAverage = "coffee";
			return story;
		}

		if ( story.votes.some( ( vote: Vote ) => vote.currentValue === "?" ) ) {
			story.voteAverage         = "?";
			story.nearestPointAverage = "?";
			return story;
		}

		const valueIsHidden = story.votes.some(
			( vote: Vote ) => vote.currentValue === "!" || vote.currentValue === "#",
		);

		if ( valueIsHidden ) {
			story.voteAverage         = "unknown";
			story.nearestPointAverage = "#";
			return story;
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

		return story;
	}

	/**
	 * Starts a new story.
	 *
	 * @param {string=} name The name of the new story.
	 *
	 * @returns {void}
	 */
	public newStory( name = "" ): void {
		// If the averages is not a number, like "coffee", don't add to the history.
		if ( typeof this.currentStory.voteAverage === "number" ) {
			// Save the current story to the history.
			this.history.push( this.currentStory );
		}

		// Reset the current story.
		this.currentStory = { name, votes: [], voters: this.getVoterCount(), votesRevealed: false };
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
	 * @returns {void} Nothing.
	 */
	public toggleRevealVotes(): void {
		this.currentStory.votesRevealed = ! this.currentStory.votesRevealed;
	}
}
