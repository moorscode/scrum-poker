import EmojiPointProvider from "./EmojiPointProvider";
import FibonacciPointProvider from "./FibonacciPointProvider";
import { PointProviderInterface } from "./PointProviderInterface";
import { VotingSystem } from "./VotingSystem";

/**
 * A factory that constructs the right PointProvider class depending on the used voting system.
 */
export default class PointProviderFactory {
	/**
	 * Construct a pointProvider for a given voting system.
	 *
	 * @param {VotingSystem} votingSystem The voting system to get the point provider for.
	 *
	 * @returns {PointProviderInterface} The pointProvider for the given voting system.
	 */
	public getPointProvider( votingSystem: VotingSystem ): PointProviderInterface {
		switch ( votingSystem ) {
			case "Emoji":
				return new EmojiPointProvider();
			case "Points":
			default:
				return new FibonacciPointProvider();
		}
	}
}
