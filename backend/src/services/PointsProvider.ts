import { Injectable } from "@nestjs/common";

export type PointValue = 0 | 0.5 | 1 | 2 | 3 | 5 | 8 | 13 | 21 | 100 | "?" | "coffee";
export type EmotionValue = "😄" | "🙂" | "😕" | "😣";
export type VoteValue = PointValue | EmotionValue;

export type VotingSystem = "Points" | "Emoji";

@Injectable()
/**
 * The points service.
 */
export default class PointsProvider {
	/**
	 * Returns all available points.
	 *
	 * @param {VotingSystem} votingSystem The voting system to get the available points for.
	 *
	 * @returns {VoteValue[]} The points.
	 */
	public getPoints( votingSystem: VotingSystem = "Points" ): VoteValue[]  {
		switch ( votingSystem ) {
			case "Emoji":
				return [ "😄", "🙂", "😕", "😣" ];
			case "Points":
			default:
				return [ 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, "?", "coffee" ];
		}
	}

	/**
	 * Checks if a cast vote is a valid vote option.
	 *
	 * @param {VotingSystem} votingSystem The voting system to validate the vote for.
	 * @param vote The vote input to validate.
	 *
	 * @return {boolean} Whether the vote is valid.
	 */
	public isValid( votingSystem: VotingSystem, vote: any ) {
		return this.getPoints( votingSystem ).includes( vote );
	}

	/**
	 * Returns all numeric points.
	 *
	 * @param {VotingSystem} votingSystem The voting system to get the numeric points for.
	 *
	 * @returns {number[]} The numeric points.
	 */
	public getNumericPoints( votingSystem: VotingSystem ): number[] {
		return this.getPoints( votingSystem ).filter(
			( x: PointValue ) => parseFloat( x as string ) === x,
		) as number[];
	}
}
