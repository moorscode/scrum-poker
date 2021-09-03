import { Injectable } from "@nestjs/common";
import cards from "../../config/cards";

export type Card = {
	id: string;
	description: string;
	from?: string;
	to?: string;
};

@Injectable()
/**
 * The points service.
 */
export default class CardsProvider {
	/**
	 * Returns all available cards.
	 *
	 * @returns {Card[]} The cards.
	 */
	public getCards(): Card[] {
		const list = cards.map( ( line: string ) => {
			return { description: line, id: this.generateId() };
		} );

		return Object.assign( [], list );
	}

	/**
	 * Generates an ID.
	 *
	 * @returns {string} Generated ID.
	 *
	 * @private
	 */
	private generateId(): string {
		return (
			Date.now().toString( 32 ).substr( 4, 3 ) + Math.random().toString( 32 ).substr( 2, 5 )
		).toUpperCase();
	}
}
