import CardsProvider, { Card } from "./CardsProvider";
import GameMemberManager, { Member } from "./GameMemberManager";

export type Game = {
	cards: Card[];
	members: Member[];
	started: boolean;
	finished: boolean;
}

/**
 * Poker story handler.
 */
export default class GameHandler {
	private readonly game: Game;

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
		this.game = { cards: [], members: [], started: false, finished: false };
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
	 * @returns {void}
	 */
	public startGame(): void {
		this.game.members = this.membersManager.getConnected();

		if ( this.assignCards() ) {
			this.game.started  = true;
			this.game.finished = false;
		}
	}

	/**
	 * Finishes a game.
	 *
	 * @returns {void}
	 */
	public finishGame(): void {
		this.game.finished = true;
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
