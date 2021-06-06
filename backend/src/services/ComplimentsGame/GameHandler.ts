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
			for ( let counter = 0; counter < cardsPerMember; counter ++ ) {
				this.game.cards[ cardIndex ].from = member.id;
				cardIndex ++;
			}
		} );

		return true;
	}

	/**
	 * Starts a game.
	 *
	 * @returns {string}
	 */
	public startGame(): string {
		this.game.members = this.membersManager.getConnected();

		if ( this.assignCards() ) {
			this.game.started = true;

			return this.selectTurnMemberId();
		}

		return "";
	}

	public giveCard( memberId: string, cardDescription: string, to: string ): string {
		const theCard = this.game.cards.find( ( card: Card ) => card.description === cardDescription );
		theCard.to    = to;

		return this.selectTurnMemberId();
	}

	private selectTurnMemberId(): string {
		// Only if there are still cards left...
		if ( ! this.haveAvailableCards() ) {
			this.finishGame();
			return "";
		}

		let memberIds = this.game.members.map( ( member: Member ) => member.id );
		memberIds     = memberIds.filter( ( memberId ) => memberId !== this.lastTurnMemberId );

		memberIds = memberIds.filter( ( memberId ) =>
			this.game.cards.filter( ( card: Card ) => card.from === memberId && card.to === "" ),
		);

		/**
		 * This is not needed with the skip functionality.
		 *
		memberIds = memberIds.filter( ( memberId ) =>
			this.membersManager.getConnected().map( ( member: Member ) => member.id ).includes( memberId ),
		);
		 **/

		if ( memberIds.length === 0 ) {
			this.finishGame();
			return "";
		}

		const index = Math.floor( Math.random() * memberIds.length );

		this.lastTurnMemberId = memberIds[ index ];

		return memberIds[ index ];
	}

	public getTurnMemberId(): string {
		return this.lastTurnMemberId;
	}

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

	public voteSkip( memberId: string ): void {
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
		for ( let index = array.length - 1; index > 0; index -- ) {
			const secondIndex    = Math.floor( Math.random() * ( index + 1 ) );
			const temp           = array[ index ];
			array[ index ]       = array[ secondIndex ];
			array[ secondIndex ] = temp;
		}

		return array;
	}
}
