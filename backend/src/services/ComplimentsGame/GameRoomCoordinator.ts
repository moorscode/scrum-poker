import CardsProvider from "./CardsProvider";
import GameHandler, { Game } from "./GameHandler";
import GameMemberManager, { Member, MemberList } from "./GameMemberManager";

/**
 * Poker Room
 */
export default class GameRoomCoordinator {
	private readonly membersManager: GameMemberManager;
	private gameHandler: GameHandler;

	/**
	 * Poker Room coordinator constructor.
	 *
	 * @param {CardsProvider} cardsProvider The cards provider.
	 */
	constructor( private readonly cardsProvider: CardsProvider ) {
		this.membersManager = new GameMemberManager();
	}

	/**
	 * Starts a new story.
	 *
	 * @returns {void}
	 */
	public newGame(): void {
		// Create a new story.
		this.gameHandler = new GameHandler( this.membersManager, this.cardsProvider );
	}

	public startGame(): string {
		return this.gameHandler.startGame();
	}

	public giveCard( memberId: string, card: string, to: string ): string {
		return this.gameHandler.giveCard( memberId, card, to );
	}

	public getTurnMemberId(): string {
		return this.gameHandler.getTurnMemberId();
	}

	public voteSkip( memberId: string ): void {
		this.gameHandler.voteSkip( memberId );
	}

	/**
	 * Gets the current story.
	 *
	 * @returns {Game} The current story.
	 */
	public getGame(): Game {
		return this.gameHandler.getGame();
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {MemberList[]} List of clients.
	 */
	public getMembers(): MemberList {
		return this.membersManager.getMembers();
	}

	/**
	 * Lists disconnected members in a room.
	 *
	 * @returns {Member[]} List of disconnected members.
	 */
	public getDisconnected(): Member[] {
		return this.membersManager.getDisconnected();
	}

	/**
	 * Retrieves the total client count.
	 *
	 * @param {boolean} includeDisconnected Take disconnected clients into account.
	 *
	 * @returns {number} The total number of clients connected.
	 */
	public getClientCount( includeDisconnected = true ): number {
		return this.membersManager.getClientCount( includeDisconnected );
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
		this.membersManager.addMember( id, name );
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
		this.membersManager.setMemberName( id, name );
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
		this.membersManager.removeMember( id );
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} id The user ID.
	 *
	 * @returns {void}
	 */
	public setDisconnected( id: string ): void {
		this.membersManager.setDisconnected( id );
	}
}
