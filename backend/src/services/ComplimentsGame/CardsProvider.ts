import { Injectable } from "@nestjs/common";

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
		return [
			{
				description: "You give great compliments",
			},
			{
				description: "You are a good listener",
			},
			{
				description: "You are a also good listener",
			},
		];
	}
}
