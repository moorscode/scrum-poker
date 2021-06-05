import PointsProvider from "../../../backend/src/services/Poker/PointsProvider";

describe( "PointsProvider", () => {
	let pointsProvider: PointsProvider;

	beforeEach( async () => {
		pointsProvider = new PointsProvider();
	} );

	describe( "getPoints", () => {
		it( "should return all points", () => {
			const result = pointsProvider.getPoints();

			expect( result ).toStrictEqual( [ 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, "?", "coffee" ] );
		} );
	} );

	describe( "getNumericPoints", () => {
		it( "should not return non-numeric points", () => {
			const result = pointsProvider.getNumericPoints();

			expect( result ).not.toContain( "?" );
			expect( result ).not.toContain( "coffee" );
		} );
	} );
} );
