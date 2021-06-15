import CardsProvider, { Card } from "./CardsProvider";
import GameHandler, { Game, GameMemberList } from "./GameHandler";
import GameMemberManager, { Member } from "./GameMemberManager";

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
		this.gameHandler = new GameHandler( this.membersManager, this.cardsProvider );
	}

	/**
	 * Starts a game.
	 *
	 * @returns {void}
	 */
	public startGame(): void {
		this.gameHandler.startGame();
	}

	/**
	 * Finishes a game.
	 *
	 * @returns {void}
	 */
	public finishGame(): void {
		this.gameHandler.finishGame();
	}

	/**
	 * Gives a card to another member.
	 *
	 * @param {string} memberId The giver.
	 * @param {string} card The card.
	 * @param {string} to The receiver.
	 *
	 * @returns {Card} The picked card.
	 */
	public giveCard( memberId: string, card: string, to: string ): Card {
		return this.gameHandler.giveCard( memberId, card, to );
	}

	/**
	 * Retrieves the member who's turn it is.
	 *
	 * @returns {string} The member's ID.
	 */
	public getTurnMemberId(): string {
		return this.gameHandler.getTurnMemberId();
	}

	/**
	 * Votes to skip the current turn.
	 *
	 * @returns {void}
	 */
	public voteSkip(): void {
		this.gameHandler.voteSkip();
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
	 * Marks a member as ready to start.
	 *
	 * @param {string} memberId The member.
	 *
	 * @returns {void}
	 */
	public setReady( memberId: string ): void {
		this.gameHandler.setReady( memberId );
	}

	/**
	 * Retrieves a card by ID.
	 *
	 * @param {string} cardId The card ID.
	 *
	 * @returns {Card} The card.
	 */
	public getCard( cardId: string ): Card {
		return this.gameHandler.getCard( cardId );
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {GameMemberList} List of clients.
	 */
	public getMembers(): GameMemberList {
		return this.gameHandler.getMembers();
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
