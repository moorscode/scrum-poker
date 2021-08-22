import EmojiPointProvider from "../../../backend/src/services/voting/EmojiPointProvider";

describe( "EmojiPointProvider", () => {
	let emojiPointProvider: EmojiPointProvider;

	beforeEach( async () => {
		emojiPointProvider = new EmojiPointProvider();
	} );

	describe( "getPoints", () => {
		it( "should return all points", () => {
			const result = emojiPointProvider.getPoints();

			expect( result ).toStrictEqual( [ "😄", "🙂", "😕", "😣" ] );
		} );
	} );

	describe( "getNumericPoints", () => {
		it( "should not return non-numeric points", () => {
			const result = emojiPointProvider.getNumericPoints();

			expect( result ).not.toContain(  "😄" );
			expect( result ).not.toContain(  "🙂" );
			expect( result ).not.toContain(  "😕" );
			expect( result ).not.toContain(  "😣" );
			expect( result ).toEqual( [] );
		} );
	} );
} );
