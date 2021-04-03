import PointsProvider from "./PointsProvider";
import PokerHistoryList from "./PokerHistoryList";
import PokerMembersHandler, { Member, MemberList } from "./PokerMembersHandler";
import { CurrentVotes, GroupVoteNames } from "./PokersService";
import PokerStoryHandler, { Story, Vote, VoteValue } from "./PokerStoryHandler";

/**
 * Poker Room
 */
export default class PokerRoomCoordinator {
	private readonly membersService: PokerMembersHandler = new PokerMembersHandler();
	private readonly historyList: PokerHistoryList = new PokerHistoryList();
	private storyService: PokerStoryHandler;

	/**
	 * Poker Room coordinator constructor.
	 *
	 * @param {PointsProvider} pointsProvider The points provider.
	 */
	constructor( private readonly pointsProvider: PointsProvider ) {}

	/**
	 * Retrieves all stories for the room.
	 *
	 * @returns {Story[]} The stories of the room.
	 */
	public getHistory(): Story[] {
		return this.historyList.getHistory();
	}

	/**
	 * Resets stories history.
	 *
	 * @returns {void}
	 */
	public resetHistory(): void {
		this.historyList.reset();
	}

	/**
	 * Removes the last history item.
	 *
	 * @returns {void}
	 */
	public removeLastHistoryEntry(): void {
		this.historyList.removeLastEntry();
	}

	/**
	 * Gets the current story.
	 *
	 * @returns {Story} The current story.
	 */
	public getStory(): Story {
		return this.storyService.getStory();
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {MemberList[]} List of clients.
	 */
	public getMembers(): MemberList {
		return this.membersService.getMembers();
	}

	/**
	 * Lists voters in a room.
	 *
	 * @returns {Member[]} List of voters.
	 */
	public getVoters(): Member[] {
		return this.membersService.getVoters();
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {Member[]} List of observers.
	 */
	public getObservers(): Member[] {
		return this.membersService.getObservers();
	}

	/**
	 * Lists disconnected members in a room.
	 *
	 * @returns {Member[]} List of disconnected members.
	 */
	public getDisconnected(): Member[] {
		return this.membersService.getDisconnected();
	}

	/**
	 * Retrieves the total client count.
	 *
	 * @param {boolean} includeDisconnected Take disconnected clients into account.
	 *
	 * @returns {number} The total number of clients connected.
	 */
	public getClientCount( includeDisconnected = true ): number {
		return this.membersService.getClientCount( includeDisconnected );
	}

	/**
	 * Adds a client to a room.
	 *
	 * @param {string} id The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public addClient( id: string, name: string ): void {
		this.membersService.addMember( id, name );

		this.recalculateStory();
	}

	/**
	 * Recalculates the story.
	 *
	 * @returns {void}
	 */
	public recalculateStory(): void {
		this.storyService.recalculate();
	}

	/**
	 * Adds a name to a client.
	 *
	 * @param {string} id The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public setClientName( id: string, name: string ): void {
		this.membersService.setMemberName( id, name );
	}

	/**
	 * Removes a client from the room.
	 *
	 * @param {string} id The User ID.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public removeClient( id: string ): void {
		this.membersService.removeMember( id );

		this.storyService.removeVote( id );
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} id The user.
	 *
	 * @returns {void}
	 */
	public makeObserver( id: string ): void {
		this.membersService.makeObserver( id );

		this.storyService.removeVote( id );
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} id The user ID.
	 *
	 * @returns {void}
	 */
	public setDisconnected( id: string ): void {
		this.membersService.setDisconnected( id );

		this.storyService.recalculate();
	}

	/**
	 * Retrieves the voted voters.
	 *
	 * @returns {Member[]} List of voted voters.
	 */
	public getVotedClients(): Member[] {
		return this.storyService.getVotedClients();
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
		this.storyService.castVote( memberId, vote );
	}

	/**
	 * Gets the vote that a user has cast for the current
	 *
	 * @param {string} memberId The ID of the user.
	 *
	 * @returns {Vote} The vote of the user.
	 */
	public getCurrentVote( memberId: string ): Vote | undefined {
		return this.storyService.getCurrentVote( memberId );
	}

	/**
	 * Lists the votes in a room for the current story.
	 *
	 * @returns {Vote[]} List of votes.
	 */
	public getCurrentVotes(): Vote[] {
		return this.storyService.getVotes();
	}

	/**
	 * Toggles between showing and or hiding the current votes.
	 *
	 * @returns {void} Nothing.
	 */
	public toggleRevealVotes(): void {
		this.storyService.toggleRevealVotes();
	}

	/**
	 * Starts a new story.
	 *
	 * @returns {void}
	 */
	public newStory(): void {
		// If the averages is not a number, like "coffee", don't add to the history.
		if ( this.storyService && typeof this.storyService.getStory().voteAverage === "number" ) {
			// Save the current story to the history.
			this.getHistory().push( this.storyService.getStory() );
		}

		this.storyService = new PokerStoryHandler( this.membersService, this.pointsProvider );
	}

	/**
	 * Sets the storyName name.
	 *
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 */
	public setStoryName( name: string ): void {
		this.storyService.setName( name );
	}

	/**
	 * Retrieves the votes for a room.
	 *
	 * @returns {CurrentVotes} Votes in that room. Obfuscated if not all votes are in yet.
	 */
	public getVotes(): CurrentVotes {
		const voted: Member[] = this.getVotedClients();
		const votes: Vote[] = this.getCurrentVotes();

		const groupedVoterNames: GroupVoteNames = voted.reduce( ( accumulator, member: Member ) => {
			const vote: Vote            = this.getCurrentVote( member.id );
			const voteGroupKey: string  = vote.initialValue + "/" + vote.currentValue;

			accumulator[ voteGroupKey ] = accumulator[ voteGroupKey ] || [];
			accumulator[ voteGroupKey ].push( member.name );

			return accumulator;
		}, {} );

		return {
			voteCount: voted.length,
			votes,
			groupedVoterNames,
		};
	}
}
