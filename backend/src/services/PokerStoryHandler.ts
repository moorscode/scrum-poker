import PointsProvider, { PointValue } from "services/PointsProvider";
import PokerMembersHandler, { Member } from "./PokerMembersHandler";

export type ObscuredVoteValue = "#" | "!";
export type VoteValue = PointValue | ObscuredVoteValue;

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

export interface ObscuredVote extends Vote {
	currentValue: ObscuredVoteValue;
	initialValue: ObscuredVoteValue;
}

/**
 * Poker story handler.
 */
export default class PokerStoryHandler {
	private story: Story = { name: "", votes: [], voters: 0, votesRevealed: false };
	private readonly membersService: PokerMembersHandler;

	/**
	 * Creates a new Poker Story.
	 *
	 * @param {PokerMembersHandler} membersService The members service to use.
	 */
	public constructor( membersService: PokerMembersHandler ) {
		this.membersService = membersService;
	}

	/**
	 * Retrieves the story.
	 *
	 * @returns {Story} The story.
	 */
	public getStory(): Story {
		return this.story;
	}

	/**
	 * Sets the storyName name.
	 *
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 */
	 public setName( name: string ): void {
		this.story.name = name;
	}

	/**
	 * Recalculates the story.
	 *
	 * @param {Story} story The base story to use.
	 *
	 * @returns {Story} The modified story.
	 */
	 public recalculate(): void {
		this.story.votesRevealed = false;
		this.story.voters = this.membersService.getVoterCount();

		this.setStoryAverage();
	}

	/**
	 * Calculates and sets the story average value.
	 *
	 * @param {Story} story The story.
	 *
	 * @returns {Story} The adjusted story.
	 */
	 private setStoryAverage(): void {
		const story = this.story;

		if ( story.votes.length === 0 ) {
			delete story.voteAverage;
			delete story.nearestPointAverage;

			return;
		}

		if ( story.votes.some( ( vote: Vote ) => vote.currentValue === "coffee" ) ) {
			story.voteAverage         = "coffee";
			story.nearestPointAverage = "coffee";

			return;
		}

		if ( story.votes.some( ( vote: Vote ) => vote.currentValue === "?" ) ) {
			story.voteAverage         = "?";
			story.nearestPointAverage = "?";

			return;
		}

		const valueIsHidden = story.votes.some(
			( vote: Vote ) => vote.currentValue === "!" || vote.currentValue === "#",
		);

		if ( valueIsHidden ) {
			story.voteAverage         = "unknown";
			story.nearestPointAverage = "#";

			return;
		}

		const pointTotal  = story.votes.reduce<number>(
			( accumulator: number, vote: Vote ) =>
				accumulator + ( vote.currentValue as number ),
			0,
		);
		story.voteAverage = Math.fround( pointTotal / story.votes.length );

		// Find the nearest available point. Always round up.
		for ( const availablePoint of PointsProvider.getNumericPoints() ) {
			if ( story.voteAverage - availablePoint <= 0 ) {
				story.nearestPointAverage = availablePoint as PointValue;
				break;
			}
		}
	}

	/**
	 * Toggles between showing and or hiding the current votes.
	 *
	 * @returns {void} Nothing.
	 */
	 public toggleRevealVotes(): void {
		this.story.votesRevealed = ! this.story.votesRevealed;
	}

	/**
	 * Checks if everybody has voted.
	 *
	 * @param {Story} story The story.
	 *
	 * @returns {boolean} True if every client has voted.
	 */
	private hasAllVotes(): boolean {
		return this.story.votes.length === this.membersService.getVoterCount();
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
	 * Removes a vote from a user.
	 *
	 * @param {string} memberId User ID to remove the vote of.
	 *
	 * @returns {void}
	 */
	public removeVote( memberId: string ): void {
		// Remove client's current votes.
		this.story.votes = this.story.votes.filter(
			( vote: Vote ) => vote.voter.id !== memberId,
		);

		this.recalculate();
	}

	/**
	 * Adds a vote to the current story.
	 *
	 * @param {string} memberId The user Id.
	 * @param {VoteValue} voteValue The vote.
	 *
	 * @returns {void}
	 */
	private addVote( memberId: string, voteValue: VoteValue ): void {
		const vote: Vote = {
			story: this.story,
			voter: this.membersService.getMembers()[ memberId ],
			initialValue: voteValue,
			currentValue: voteValue,
		};

		this.story.votes.push( vote );

		this.recalculate();
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
		const currentVote: Vote = this.getCurrentVote( memberId );

		if ( ! this.hasAllVotes() ) {
			currentVote.initialValue = vote;
		}
		if ( currentVote.initialValue === "coffee" ) {
			currentVote.initialValue = vote;
		}
		currentVote.currentValue = vote;

		this.recalculate();
	}

	/**
	 * Gets the vote that a user has cast for the current
	 *
	 * @param {string} memberId The ID of the user.
	 *
	 * @returns {Vote} The vote of the user.
	 */
	 public getCurrentVote( memberId: string ): Vote | undefined {
		return this.story.votes.filter( ( vote: Vote ) => vote.voter.id === memberId )[ 0 ];
	}

	/**
	 * Lists the votes in a room for the current story.
	 *
	 * @returns {Vote[]} List of votes.
	 */
	public getVotes(): Vote[] {
		if ( this.story.votesRevealed || this.hasAllVotes() ) {
			return this.getUnobscuredVotes();
		}

		return this.getObscuredVotes();
	}

	/**
	 * Gets all casted votes and backfills the missing votes with "?".
	 *
	 * @param {Story} story The story to get votes for.
	 *
	 * @returns {Vote[]} The actual votes with the backfilled missing votes.
	 */
	 private getUnobscuredVotes(): Vote[] {
		const notVotedClients:Member[] = this.getVotePendingClients();
		const notVoted = notVotedClients.map(
			( client: Member ): ObscuredVote => this.getObscuredVote( client ),
		);

		return [
			// The actual votes.
			...this.story.votes,
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
	private getObscuredVotes(): ObscuredVote[] {
		return this.membersService.getActiveMembers()
			.map( ( member: Member ): ObscuredVote => this.getObscuredVote( member ) )
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
	 * @param {Member} member The client to get the obscured vote for.
	 *
	 * @returns {ObscuredVote} The obscured vote representing an hidden cast vote ("X") or a missing vote ("?").
	 */
	private getObscuredVote( member: Member ): ObscuredVote {
		const hasVoted: boolean = typeof( this.getCurrentVote( member.id ) ) !== "undefined";
		const voteValue: ObscuredVoteValue = hasVoted ? "!" : "#";

		return {
			initialValue: voteValue,
			currentValue: voteValue,
			voter: member,
			story: this.story,
		};
	}

	/**
	 * Retrieves the voted voters.
	 *
	 * @returns {Member[]} List of voted voters.
	 */
	public getVotedClients(): Member[] {
		return this.membersService.getActiveMembers()
			.filter( ( member: Member ) => this.story.votes.map( ( vote: Vote ) => vote.voter.id ).includes( member.id ) );
	}

	/**
	 * Retrieves the voters that haven't voted yet.
	 *
	 * @returns {Member[]} List of voters that haven't voted yet.
	 */
	private getVotePendingClients(): Member[] {
		return this.membersService.getActiveMembers()
			.filter( ( member: Member ) => ! this.story.votes.map( ( vote: Vote ) => vote.voter.id ).includes( member.id ) );
	}
}
