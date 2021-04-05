import PokerHistoryList from "../../../backend/src/services/PokerHistoryList";
import { Story } from "../../../backend/src/services/PokerStoryHandler";

describe( "PokerHistoryList", () => {
	let pokerHistoryList: PokerHistoryList;
	let story: Story;

	beforeEach( () => {
		pokerHistoryList = new PokerHistoryList();

		story = {} as unknown as Story;
	} );

	describe( "addStory", () => {
		it( "adds a story to the list", () => {
			story.voteAverage = 1;

			pokerHistoryList.addStory( story );

			expect( pokerHistoryList.getHistory() ).toHaveLength( 1 );
			expect( pokerHistoryList.getHistory() ).toContain( story );
		} );

		it( "doesnt add a story with no numeric vote average", () => {
			story.voteAverage = "?";

			pokerHistoryList.addStory( story );

			expect( pokerHistoryList.getHistory() ).toHaveLength( 0 );
		} );
	} );

	describe( "reset", () => {
		it( "resets the history", () => {
			story.voteAverage = 1;

			pokerHistoryList.addStory( story );
			pokerHistoryList.addStory( story );

			expect( pokerHistoryList.getHistory() ).toHaveLength( 2 );

			pokerHistoryList.reset();

			expect( pokerHistoryList.getHistory() ).toHaveLength( 0 );
		} );
	} );

	describe( "removeLastEntry", () => {
		it( "removes the last history entry", () => {
			const story1 = { voteAverage: 1 } as unknown as Story;
			const story2 = { voteAverage: 2 } as unknown as Story;

			pokerHistoryList.addStory( story1 );
			pokerHistoryList.addStory( story2 );

			expect( pokerHistoryList.getHistory() ).toHaveLength( 2 );

			pokerHistoryList.removeLastEntry();

			expect( pokerHistoryList.getHistory() ).toHaveLength( 1 );
			expect( pokerHistoryList.getHistory()[ 0 ] ).toStrictEqual( story1 );
		} );
	} );
} );
