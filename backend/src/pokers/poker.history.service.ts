import { Story } from "./poker.story.service";

export default class PokerHistoryService {
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
	 * Adds a history entry.
	 *
	 * @returns {void}
	 */
	public addStory( story: Story ): void {
		this.history.push( story );
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
