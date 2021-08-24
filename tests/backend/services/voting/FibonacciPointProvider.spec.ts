import FibonacciPointProvider from "../../../../backend/src/services/voting/FibonacciPointProvider";

describe( "FibonacciPointProvider", () => {
	let fibonacciPointProvider: FibonacciPointProvider;

	beforeEach( async () => {
		fibonacciPointProvider = new FibonacciPointProvider();
	} );

	describe( "getPoints", () => {
		it( "should return all points", () => {
			const result = fibonacciPointProvider.getPoints();

			expect( result ).toStrictEqual( [ 0, 0.5, 1, 2, 3, 5, 8, 13, 21, 100, "?", "coffee" ] );
		} );
	} );

	describe( "getNumericPoints", () => {
		it( "should not return non-numeric points", () => {
			const result = fibonacciPointProvider.getNumericPoints();

			expect( result ).not.toContain( "?" );
			expect( result ).not.toContain( "coffee" );
		} );
	} );
} );
