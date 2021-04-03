import PointsProvider from "../../src/services/PointsProvider";
import { Test } from "@nestjs/testing";

describe( "PointsProvider", () => {
	let pointsProvider: PointsProvider;

	beforeEach( async () => {
		const moduleRef = await Test.createTestingModule( {
			controllers: [ PointsProvider ],
		} ).compile();

		pointsProvider = moduleRef.get<PointsProvider>( PointsProvider );
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
