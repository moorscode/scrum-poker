import PokerHistoryService from "./poker.history.service";
import PokerMembersService, { Member, MemberList } from "./poker.members.service";
import PokerStoryService, { Story, Vote, VoteValue } from "./poker.story.service";

/**
 * Poker Room
 */
export default class PokerRoomService {
	private readonly membersService: PokerMembersService = new PokerMembersService();
	private readonly historyService: PokerHistoryService = new PokerHistoryService();
	private storyService: PokerStoryService = new PokerStoryService( this.membersService );
	
	/**
	 * Retrieves all stories for the room.
	 *
	 * @returns {Story[]} The stories of the room.
	 */
	public getHistory(): Story[] {
		return this.historyService.getHistory();
	}

	/**
	 * Resets stories history.
	 *
	 * @returns {void}
	 */
	public resetHistory(): void {
		this.historyService.reset();
	}
	
	/**
	 * Removes the last history item.
	 *
	 * @returns {void}
	 */
	public removeLastHistoryEntry(): void {
		this.historyService.removeLastEntry();
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
	 *
	 * @private
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
	 * Lists all poker voters.
	 *
	 * @returns {number} Number of voters.
	 *
	 * @private
	 */
	public getVoterCount(): number {
		return this.membersService.getVoterCount();
	}

	/**
	 * Lists the active members of the room.
	 *
	 * @returns {Member[]} List of active members.
	 */
	public getActiveMembers(): Member[] {
		return this.membersService.getActiveMembers();
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
	 * @param {string} memberId The user.
	 *
	 * @returns {void}
	 */
	public setDisconnected( id: string ): void {
		this.membersService.setDisconnected( id );

		this.storyService.recalculate();
	}

	/**
	 * Removes timed out members.
	 *
	 * @returns {boolean} True if a member was removed.
	 */
	public cleanupMembers(): boolean {
		const deleted = this.membersService.removeTimedOutMembers();

		if ( deleted ) {
			this.storyService.recalculate();
		}

		return deleted;
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
		if ( typeof this.storyService.getStory().voteAverage === "number" ) {
			// Save the current story to the history.
			this.historyService.addStory( this.storyService.getStory() );
		}

		this.storyService = new PokerStoryService( this.membersService );
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
}
