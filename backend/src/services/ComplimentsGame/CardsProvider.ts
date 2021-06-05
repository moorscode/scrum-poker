import { Injectable } from "@nestjs/common";

export type Card = {
	description: string;
	dealt: boolean;
	received: boolean;
	receivedFrom?: string;
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
				dealt: true,
				received: false,
			},
			{
				description: "You are a good listener",
				dealt: true,
				received: false,
			},
		];
	}
}
