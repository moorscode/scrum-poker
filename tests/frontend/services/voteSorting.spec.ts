import { Vote } from "../../../backend/src/services/PokerStoryHandler";
import { sortVotes } from "../../../frontend/src/services/voteSorting";

describe( "the voteSorting", () => {
	describe( "sortVotes function", () => {
		/**
		 * Creates a test double vote object.
		 *
		 * @param {number | string} initialValue The initial vote value.
		 * @param {number | string} currentValue The current vote value, uses the initial value by default.
		 *
		 * @returns {Partial<Vote>} The vote test double.
		 */
		const getVote = ( initialValue: number | string, currentValue?: number | string ): Partial<Vote> => {
			return {
				initialValue,
				currentValue: currentValue || initialValue,
			};
		};

		it.each(
			[
				{
					description: "All numeric votes and points",
					votes: [
						getVote( 1 ),
						getVote( 5 ),
						getVote( 2 ),
					],
					availablePoints: [ 1, 2, 3, 4, 5 ],
					expected: [
						getVote( 1 ),
						getVote( 2 ),
						getVote( 5 ),
					],
				},
				{
					description: "Already ordered votes",
					votes: [
						getVote( 1 ),
						getVote( 2 ),
						getVote( 3 ),
					],
					availablePoints: [ 1, 2, 3, "four", "five" ],
					expected: [
						getVote( 1 ),
						getVote( 2 ),
						getVote( 3 ),
					],
				},
				{
					description: "String and numeric votes",
					votes: [
						getVote( 1 ),
						getVote( "four" ),
						getVote( 3 ),
					],
					availablePoints: [ 1, 2, 3, "four", 5 ],
					expected: [
						getVote( 1 ),
						getVote( 3 ),
						getVote( "four" ),
					],
				},
				{
					description: "Order on initial vote if the current votes are equal",
					votes: [
						getVote( 5, 3 ),
						getVote( 2, 3 ),
						getVote( 3 ),
					],
					availablePoints: [ 1, 2, 3, 4, 5 ],
					expected: [
						getVote( 2, 3 ),
						getVote( 3 ),
						getVote( 5, 3 ),
					],
				},
				{
					description: "String and numeric votes combined",
					votes: [
						getVote( "three" ),
						getVote( 2, "three" ),
						getVote( 1 ),
					],
					availablePoints: [ 1, 2, "three", 4, 5 ],
					expected: [
						getVote( 1 ),
						getVote( 2, "three" ),
						getVote( "three" ),
					],
				},
				{
					description: "No available points - don't sort",
					votes: [
						getVote( "three" ),
						getVote( 2, "three" ),
						getVote( 1 ),
					],
					availablePoints: [],
					expected: [
						getVote( "three" ),
						getVote( 2, "three" ),
						getVote( 1 ),
					],
				},
				{
					description: "No available points and no votes - don't sort",
					votes: [],
					availablePoints: [],
					expected: [],
				},
				{
					description: "No votes - don't sort",
					votes: [],
					availablePoints: [ 1, 2, 3 ],
					expected: [],
				},
				{
					description: "Illegal point value used - don't sort",
					votes: [
						getVote( 2 ),
						getVote( "illegal" ),
						getVote( 1 ),
					],
					availablePoints: [ 1, 2 ],
					expected: [
						getVote( 2 ),
						getVote( "illegal" ),
						getVote( 1 ),
					],
				},
			],
		)( "sorts votes: %s", ( { votes, availablePoints, expected } ) => {
			const actual = sortVotes( votes, availablePoints );

			expect( actual ).toEqual( expected );
		} );
	} );
} );
