import { PointProviderInterface } from "./PointProviderInterface";

/**
 * Provides valid point values for the Fibonacci point scheme.
 */
export default class FibonacciPointProvider implements PointProviderInterface {
	/**
	 * Gets the available points for the fibonacci point scheme.
	 *
	 * @returns {(string | number)[]} The available point values.
	 */
	public getPoints(): ( string | number )[] {
		return [ 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, "?", "coffee" ];
	}

	/**
	 * Gets the available points for the fibonacci point scheme that are numeric.
	 *
	 * @returns {number[]} The available numeric point values.
	 */
	public getNumericPoints(): number[] {
		return this.getPoints()
			.filter( ( point: ( string | number ) ) =>
				parseFloat( point as string ) === point,
			) as number[];
	}
}
