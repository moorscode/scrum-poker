import { PointProviderInterface } from "./PointProviderInterface";

/**
 * Provides valid point values for the emoji point scheme.
 */
export default class EmojiPointProvider implements PointProviderInterface {
	/**
	 * Gets the available points for the emoji point scheme.
	 *
	 * @returns {(string | number)[]} The available point values.
	 */
	public getPoints(): ( string | number )[] {
		return [ "😄", "🙂", "😕", "😣" ];
	}

	/**
	 * Gets the available points for the emoji point scheme that are numeric.
	 *
	 * @returns {number[]} The available numeric point values.
	 */
	public getNumericPoints(): number[] {
		return [];
	}
}
