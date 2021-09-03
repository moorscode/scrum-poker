import PointProviderFactory from "../../../../backend/src/services/voting/PointProviderFactory";
import VoteValidationService from "../../../../backend/src/services/voting/VoteValidationService";

describe( "VoteValidationService", () => {
	let voteValidationService: VoteValidationService;
	let pointsProvider;

	beforeEach( async () => {
		pointsProvider = {
			getPoints: jest.fn(),
			getNumericPoints: jest.fn(),
		};

		const factory: PointProviderFactory = {
			getPointProvider: jest.fn().mockReturnValue( pointsProvider ),
		};

		voteValidationService = new VoteValidationService( factory );
	} );

	describe( "isValid", () => {
		it.each( [
			{
				points: [ 3, "?", 99, "coffee" ],
				vote: 3,
				expected: true,
			},
			{
				points: [ 3, "?", 99, "coffee" ],
				vote: "3",
				expected: false,
			},
			{
				points: [ 3, "?", 99, "coffee" ],
				vote: "coffee",
				expected: true,
			},
			{
				points: [ 3, "?", 99, "coffee" ],
				vote: "something else",
				expected: false,
			},
			{
				points: [ 3, "?", 99, "coffee" ],
				vote: 1,
				expected: false,
			},
		] )( "only accepts values that are given by the point provider - %o", ( { points, vote, expected } ) => {
			pointsProvider.getPoints.mockReturnValue( points );

			const actual = voteValidationService.isValid( "Points", vote );

			expect( pointsProvider.getPoints ).toBeCalledTimes( 1 );
			expect( actual ).toBe( expected );
		} );
	} );
} );
