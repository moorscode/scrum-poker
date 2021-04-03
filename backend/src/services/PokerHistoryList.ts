import { Story } from "./PokerStoryHandler";

/**
 * The poker history list.
 */
export default class PokerHistoryList {
	private readonly history: Story[] = [];

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
