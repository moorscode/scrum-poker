export interface PointProviderInterface {

	/**
	 * Gets the available points.
	 *
	 * @return {(string | number)[]} The available point values.
	 */
	getPoints(): ( string | number )[];

	/**
	 *  Gets the available points that are numeric.
	 *
	 * @return {number[]} The available numeric point values.
	 */
	getNumericPoints(): number[];
}
