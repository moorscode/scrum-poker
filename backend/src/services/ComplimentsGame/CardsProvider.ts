import { Injectable } from "@nestjs/common";
import cards from "../../config/cards";
import * as fs from "fs";
import * as path from "path";

export type Card = {
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
		return cards.map( ( line: string ) => {
			return { description: line };
		} );
	}
}
