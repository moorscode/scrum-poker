import { Injectable } from "@nestjs/common";

export type PointValue = 0 | 0.5 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 100 | "?" | "coffee";

@Injectable()
/**
 * The points service.
 */
export default class PointsProvider {
	/**
	 * Returns all available points.
	 *
	 * @returns {PointValue[]} The points.
	 */
	public static getPoints(): PointValue[] {
		return [ 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, "?", "coffee" ];
	}

	/**
	 * Returns all numeric points.
	 *
	 * @returns {number[]} The numeric points.
	 */
	public static getNumericPoints(): number[] {
		return this.getPoints().filter(
			( x: PointValue ) => parseFloat( x as string ) === x,
		) as number[];
	}
}
