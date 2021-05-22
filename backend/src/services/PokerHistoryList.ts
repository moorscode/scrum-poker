import { Story } from "./PokerStoryHandler";

/**
 * The poker history list.
 */
export default class PokerHistoryList {
	private readonly history: Story[] = [];

	/**
	 * Adds a story to the history.
	 *
	 * @param {Story} story The story to add.
	 *
	 * @returns {void}
	 */
	public addStory( story: Story ): void {
		// If the average is not a number, like "coffee", don't add to the history.
		if ( typeof story.voteAverage === "number" ) {
			this.history.push( story );
		}
	}

	/**
	 * Retrieves all stories for the room.
	 *
	 * @returns {Story[]} The stories of the room.
	 */
	public getHistory(): Story[] {
		return this.history;
	}

	/**
	 * Resets stories history.
	 *
	 * @returns {void}
	 */
	public reset(): void {
		this.history.splice( 0, this.history.length );
	}

	/**
	 * Removes the last history item.
	 *
	 * @returns {void}
	 */
	public removeLastEntry(): void {
		this.history.pop();
	}
}
