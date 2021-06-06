import CardsProvider, { Card } from "./CardsProvider";
import GameMemberManager, { Member } from "./GameMemberManager";

export type Game = {
	cards: Card[];
	members: Member[];
	started: boolean;
}

/**
 * Poker story handler.
 */
export default class GameHandler {
	private readonly game: Game;
	private lastTurnMemberId = "";

	/**
	 * Creates a new Poker Story.
	 *
	 * @param {GameMemberManager} membersManager The members manager to use.
	 * @param {CardsProvider} cardsProvider The cards provider.
	 */
	public constructor(
		private readonly membersManager: GameMemberManager,
		private readonly cardsProvider: CardsProvider,
	) {
		this.game = { cards: [], members: [], started: false };

		this.membersManager.on( "member-removed", this.removeMember.bind( this ) );
	}

	/**
	 * Retrieves a card by Id.
	 *
	 * @param {string} cardId The card ID.
	 *
	 * @returns {Card} The card.
	 */
	public getCard( cardId: string ): Card {
		return this.game.cards.find( ( card: Card ) => card.id === cardId );
	}

	/**
	 * Removes a member from the game.
	 *
	 * @param {string} memberId The member that left.
	 *
	 * @returns {void}
	 */
	public removeMember( memberId: string ): void {
		this.game.members = this.membersManager.getConnected();
		this.game.cards = this.game.cards.filter( ( card: Card ) => card.from !== memberId && card.to !== memberId );

		const memberCount       = this.game.members.length;
		const cardsPerMember    = memberCount - 1;

		this.game.members.forEach( ( member: Member ) => {
			// If we removed an already given card, we don't have anything else to do.
			const memberCards = this.game.cards.filter( ( card: Card ) => card.from === member.id );
			if ( memberCards.length === cardsPerMember ) {
				return;
			}

			// Remove the first unassigned card.
			const index = this.game.cards.findIndex( ( card: Card ) => card.from === member.id && ! card.to );
			this.game.cards.splice( index, 1 );
		} );
	}

	/**
	 * Assigns the cards to the members of the room.
	 *
	 * @returns {boolean} If the cards could be assigned.
	 */
	private assignCards(): boolean {
		const members: Member[] = this.game.members;
		const memberCount       = members.length;
		const cards             = this.cardsProvider.getCards();
		const cardsPerMember    = memberCount - 1;

		// Each member gets a card for all other members.
		const totalNumberOfCards = cardsPerMember * memberCount;

		if ( totalNumberOfCards < 1 ) {
			return false;
		}

		const shuffledCards = this.shuffleArray( cards );

		this.game.cards = shuffledCards.slice( 0, totalNumberOfCards ).filter( () => true );

		let cardIndex = 0;

		members.forEach( ( member: Member ) => {
			for ( let counter = 0; counter < cardsPerMember; counter++ ) {
				this.game.cards[ cardIndex ].from = member.id;
				cardIndex++;
			}
		} );

		return true;
	}

	/**
	 * Starts a game.
	 *
	 * @returns {void}
	 */
	public startGame(): void {
		this.game.members = this.membersManager.getConnected();

		if ( this.assignCards() ) {
			this.game.started = true;

			this.selectTurnMemberId();
		}
	}

	/**
	 * Gives a card to a member.
	 *
	 * @param {string} memberId The giver.
	 * @param {string} cardId The card.
	 * @param {string} to The receiver.
	 *
	 * @returns {Card} The picked card.
	 */
	public giveCard( memberId: string, cardId: string, to: string ): Card {
		const theCard = this.game.cards.find( ( card: Card ) => card.id === cardId );
		theCard.to    = to;

		this.selectTurnMemberId();

		return theCard;
	}

	/**
	 * Selects the next member who's turn it will be.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private selectTurnMemberId(): void {
		// Only if there are still cards left...
		if ( ! this.haveAvailableCards() ) {
			this.finishGame();
			return;
		}

		let memberIds = this.game.members.map( ( member: Member ) => member.id );

		memberIds = memberIds.filter(
			( memberId ) => this.game.cards.filter( ( card: Card ) => card.from === memberId && ! card.to ).length !== 0,
		);

		memberIds = [ ...new Set( memberIds ) ];

		if ( memberIds.length > 1 ) {
			memberIds = memberIds.filter( ( memberId ) => memberId !== this.lastTurnMemberId );
		}

		/**
		 * This is not needed with the skip functionality.
		 *
		memberIds = memberIds.filter( ( memberId ) =>
			this.membersManager.getConnected().map( ( member: Member ) => member.id ).includes( memberId ),
		);
		 **/

		if ( memberIds.length === 0 ) {
			this.finishGame();
			return;
		}

		const index = memberIds.length === 1 ? 0 : Math.floor( Math.random() * memberIds.length );

		this.lastTurnMemberId = memberIds[ index ];
	}

	/**
	 * Retreives who's turn it is.
	 *
	 * @returns {string} The member ID who's turn it is.
	 */
	public getTurnMemberId(): string {
		return this.lastTurnMemberId;
	}

	/**
	 * Checks if there are any ungiven cards left in the game.
	 *
	 * @returns {boolean} True if there are cards to give.
	 */
	public haveAvailableCards(): boolean {
		return this.game.cards.filter( ( card: Card ) => ! card.to ).length > 0;
	}

	/**
	 * Finishes a game.
	 *
	 * @returns {void}
	 */
	public finishGame(): void {
		this.game.started = false;
	}

	/**
	 * Retrieves the game.
	 *
	 * @returns {Game} The game.
	 */
	public getGame(): Game {
		return this.game;
	}

	/**
	 * Skips the current turn to another player.
	 *
	 * @returns {void}
	 */
	public voteSkip(): void {
		// Do something.
		this.selectTurnMemberId();
	}

	/**
	 * Shuffles an Card array.
	 *
	 * @param {Card[]} array List of cards.
	 *
	 * @returns {Card[]} Shuffled list of cards.
	 *
	 * @private
	 */
	private shuffleArray( array: Card[] ) {
		for ( let index = array.length - 1; index > 0; index-- ) {
			const secondIndex    = Math.floor( Math.random() * ( index + 1 ) );
			const temp           = array[ index ];
			array[ index ]       = array[ secondIndex ];
			array[ secondIndex ] = temp;
		}

		return array;
	}
}
