import PokerRoomCoordinator from "../../../backend/services/PokerRoomCoordinator";
import PointProviderFactory from "../../../backend/services/voting/PointProviderFactory";

describe( "PokerRoomCoordinator", () => {
	let room: PokerRoomCoordinator;

	beforeEach( () => {
		room = new PokerRoomCoordinator( new PointProviderFactory() );
	} );

	describe( "history", () => {
		it( "keeps finished stories intact when a member leaves", () => {
			room.addClient( "a", "alice" );
			room.addClient( "b", "bob" );
			room.castVote( "a", 3 );
			room.castVote( "b", 13 );
			room.newStory();

			room.removeClient( "b" );

			const [ story ] = room.getHistory();
			expect( story.votes.map( ( vote ) => vote.currentValue ) ).toStrictEqual( [ 3, 13 ] );
			expect( story.voteAverage ).toStrictEqual( 8 );
		} );

		it( "keeps finished stories intact when a member becomes an observer", () => {
			room.addClient( "a", "alice" );
			room.addClient( "b", "bob" );
			room.castVote( "a", 3 );
			room.castVote( "b", 13 );
			room.newStory();

			room.makeObserver( "b" );

			expect( room.getHistory()[ 0 ].votes ).toHaveLength( 2 );
		} );

		it( "does not add emoji stories with a meaningless average to the history", () => {
			room.setStoryVotingSystem( "Emoji" );
			room.addClient( "a", "alice" );
			room.castVote( "a", "🙂" );

			expect( room.getStory().voteAverage ).toBeUndefined();

			room.newStory();

			expect( room.getHistory() ).toHaveLength( 0 );
		} );
	} );

	describe( "getVotes", () => {
		it( "keeps votes hidden while a connected voter has not voted, even if a disconnected member voted", () => {
			room.addClient( "x", "xena" );
			room.addClient( "y", "yuri" );
			room.addClient( "z", "zoe" );
			room.castVote( "x", 8 );
			room.setDisconnected( "x" );
			room.castVote( "y", 2 );

			const values = room.getVotes().votes.map( ( vote ) => vote.currentValue );

			expect( values ).toStrictEqual( [ "!", "#" ] );
		} );

		it( "does not reveal who voted what before the votes are revealed", () => {
			room.addClient( "p", "pam" );
			room.addClient( "q", "quinn" );
			room.castVote( "p", 8 );

			expect( room.getVotes().groupedVoterNames ).toStrictEqual( {} );
		} );

		it( "groups voter names by vote once all votes are in", () => {
			room.addClient( "p", "pam" );
			room.addClient( "q", "quinn" );
			room.castVote( "p", 8 );
			room.castVote( "q", 8 );

			expect( room.getVotes().groupedVoterNames ).toStrictEqual( { "8/8": [ "pam", "quinn" ] } );
		} );

		it( "groups voter names by vote when the votes are revealed early", () => {
			room.addClient( "p", "pam" );
			room.addClient( "q", "quinn" );
			room.castVote( "p", 8 );
			room.toggleRevealVotes();

			expect( room.getVotes().groupedVoterNames ).toStrictEqual( { "8/8": [ "pam" ] } );
		} );
	} );
} );
