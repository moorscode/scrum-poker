import EmojiPointProvider from "../../../../backend/services/voting/EmojiPointProvider";
import FibonacciPointProvider from "../../../../backend/services/voting/FibonacciPointProvider";
import PointProviderFactory from "../../../../backend/services/voting/PointProviderFactory";
import { VotingSystem } from "../../../../backend/services/voting/VotingSystem";

describe( "PointProviderFactory", () => {
	let pointProviderFactory: PointProviderFactory;

	beforeEach( async () => {
		pointProviderFactory = new PointProviderFactory();
	} );

	describe( "getPointProvider", () => {
		it( "creates a emojiPointProvider for the emoji point system", async () => {
			const result = pointProviderFactory.getPointProvider( "Emoji" );
			expect( result ).toBeInstanceOf( EmojiPointProvider );
		} );
		it( "creates a FibonacciPointProvider for the emoji point system", async () => {
			const result = pointProviderFactory.getPointProvider( "Points" );
			expect( result ).toBeInstanceOf( FibonacciPointProvider );
		} );
		it( "creates a FibonacciPointProvider for any invalid point system", async () => {
			const result = pointProviderFactory.getPointProvider( "Something else" as VotingSystem );
			expect( result ).toBeInstanceOf( FibonacciPointProvider );
		} );
	} );
} );
