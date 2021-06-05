import { Card } from "./CardsProvider";
import GameMemberManager from "./GameMemberManager";

export type Game = {
	cards: Card[];
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
	 * @param {Card[]} cards List of cards to use.
	 */
	public constructor(
		private readonly membersManager: GameMemberManager,
		cards: Card[],
	) {
		this.game = { cards, started: false, finished: false };
	}

	/**
	 *
	 */
	public assignCards() {
		const members        = this.membersManager.getMembers();
		const cardsPerMember = Object.keys( members ).length - 1;

		let cardIndex = 0;

		Object.keys( members ).forEach( ( memberId ) => {
			for ( let counter = 0; counter < cardsPerMember; counter++ ) {
				this.game.cards[ cardIndex ].from = memberId;
				cardIndex++;
			}
		} );
	}

	/**
	 * Retrieves the game.
	 *
	 * @returns {Game} The game.
	 */
	public getGame(): Game {
		return this.game;
	}
}
