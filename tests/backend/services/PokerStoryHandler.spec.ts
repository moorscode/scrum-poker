import { Test } from "@nestjs/testing";
import PointsProvider from "../../../backend/src/services/PointsProvider";
import PokerMemberManager from "../../../backend/src/services/PokerMemberManager";
import PokerStoryHandler from "../../../backend/src/services/PokerStoryHandler";

describe( "PokerStoryHandler", () => {
	let pokerStoryHandler: PokerStoryHandler;
	let membersManager: PokerMemberManager;
	let pointsProvider: PointsProvider;

	beforeEach( async () => {
		const module = await Test.createTestingModule( {
			providers: [
				PokerMemberManager,
				PointsProvider,
			],
		},
		).compile();

		membersManager = module.get<PokerMemberManager>( PokerMemberManager );
		pointsProvider = module.get<PointsProvider>( PointsProvider );

		pokerStoryHandler = new PokerStoryHandler( membersManager, pointsProvider );
	} );

	describe( "setName", () => {
		it( "sets the name of a story", () => {
			pokerStoryHandler.setName( "name" );

			const story = pokerStoryHandler.getStory();

			expect( story.name ).toStrictEqual( "name" );
		} );
	} );

	describe( "getVotes", () => {
		it( "returns no votes when none are made", () => {
			const votes = pokerStoryHandler.getVotes();

			expect( votes ).toStrictEqual( [] );
		} );

		it( "returns vote when one is made", () => {
			membersManager.addMember( "member1", "Member 1" );

			pokerStoryHandler.castVote( "member1", 1 );

			const votes = pokerStoryHandler.getVotes();

			expect( votes[ 0 ].currentValue ).toStrictEqual( 1 );
			expect( votes[ 0 ].initialValue ).toStrictEqual( 1 );
		} );
	} );

	describe( "castVote", () => {
		it( "changes the initial vote when not all votes are cast", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );

			pokerStoryHandler.castVote( "member1", 1 );
			pokerStoryHandler.castVote( "member1", 2 );

			pokerStoryHandler.toggleRevealVotes();
			const votes = pokerStoryHandler.getVotes();

			expect( votes[ 0 ].initialValue ).toStrictEqual( 2 );
			expect( votes[ 0 ].currentValue ).toStrictEqual( 2 );
		} );

		it( "changes the initial vote when the first vote was coffee", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );

			pokerStoryHandler.castVote( "member1", "coffee" );
			pokerStoryHandler.castVote( "member2", 3 );

			pokerStoryHandler.castVote( "member1", 2 );

			pokerStoryHandler.toggleRevealVotes();
			const votes = pokerStoryHandler.getVotes();

			expect( votes[ 0 ].initialValue ).toStrictEqual( 2 );
			expect( votes[ 0 ].currentValue ).toStrictEqual( 2 );
		} );

		it( "changes the initial vote when the first vote was ?", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );

			pokerStoryHandler.castVote( "member1", "?" );
			pokerStoryHandler.castVote( "member2", 3 );

			pokerStoryHandler.castVote( "member1", 2 );

			pokerStoryHandler.toggleRevealVotes();
			const votes = pokerStoryHandler.getVotes();

			expect( votes[ 0 ].initialValue ).toStrictEqual( 2 );
			expect( votes[ 0 ].currentValue ).toStrictEqual( 2 );
		} );

		it( "changes a vote when one has already been cast", () => {
			membersManager.addMember( "member1", "Member 1" );

			pokerStoryHandler.castVote( "member1", 1 );
			pokerStoryHandler.castVote( "member1", 2 );

			const votes = pokerStoryHandler.getVotes();

			expect( votes ).toHaveLength( 1 );
			expect( votes[ 0 ].initialValue ).toStrictEqual( 1 );
			expect( votes[ 0 ].currentValue ).toStrictEqual( 2 );
		} );
	} );

	describe( "removeVote", () => {
		it( "removes vote of a specific member", () => {
			membersManager.addMember( "member1", "Member 1" );

			pokerStoryHandler.castVote( "member1", 1 );
			pokerStoryHandler.removeVote( "member1" );

			expect( pokerStoryHandler.getCurrentVote( "member1" ) ).toBeUndefined();
			expect( pokerStoryHandler.getVotes()[ 0 ].currentValue ).toStrictEqual( "#" );
		} );
	} );

	describe( "getVotedClients", () => {
		it( "returns the members that voted", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );

			pokerStoryHandler.castVote( "member1", 1 );

			const members = pokerStoryHandler.getVotedClients();

			expect( members ).toHaveLength( 1 );
			expect( members[ 0 ].id ).toStrictEqual( "member1" );
		} );
	} );

	describe( "getVotes", () => {
		it( "sorts obscured votes on voted vs not voted", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );
			membersManager.addMember( "member3", "Member 3" );

			pokerStoryHandler.castVote( "member1", 1 );
			pokerStoryHandler.castVote( "member3", 1 );

			const votes = pokerStoryHandler.getVotes();

			expect( votes ).toHaveLength( 3 );

			expect( votes[ 0 ].currentValue ).toStrictEqual( "!" );
			expect( votes[ 1 ].currentValue ).toStrictEqual( "!" );
			expect( votes[ 2 ].currentValue ).toStrictEqual( "#" );
		} );

		it( "shows unvoted votes at the end when revealed", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );
			membersManager.addMember( "member3", "Member 3" );

			pokerStoryHandler.castVote( "member1", 1 );
			pokerStoryHandler.castVote( "member3", 2 );

			pokerStoryHandler.toggleRevealVotes();
			const votes = pokerStoryHandler.getVotes();

			expect( votes ).toHaveLength( 3 );

			expect( votes[ 0 ].currentValue ).toStrictEqual( 1 );
			expect( votes[ 1 ].currentValue ).toStrictEqual( 2 );
			expect( votes[ 2 ].currentValue ).toStrictEqual( "#" );
		} );
	} );

	describe( "toggleRevealVotes", () => {
		it( "reveals the vote values for voted members", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );

			pokerStoryHandler.castVote( "member1", 1 );

			expect( pokerStoryHandler.getVotes()[ 0 ].currentValue ).toStrictEqual( "!" );
			expect( pokerStoryHandler.getVotes()[ 1 ].currentValue ).toStrictEqual( "#" );

			pokerStoryHandler.toggleRevealVotes();

			expect( pokerStoryHandler.getVotes()[ 0 ].currentValue ).toStrictEqual( 1 );
			expect( pokerStoryHandler.getVotes()[ 1 ].currentValue ).toStrictEqual( "#" );
		} );
	} );

	describe( "recalculate", () => {
		it( "resets when no votes are made", () => {
			pokerStoryHandler.recalculate();

			const story = pokerStoryHandler.getStory();

			expect( story.voteAverage ).toBeUndefined();
			expect( story.nearestPointAverage ).toBeUndefined();
		} );

		it( "shows coffee for any value being coffee", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );
			membersManager.addMember( "member3", "Member 3" );

			pokerStoryHandler.castVote( "member2", "coffee" );

			pokerStoryHandler.recalculate();

			const story = pokerStoryHandler.getStory();

			expect( story.voteAverage ).toStrictEqual( "coffee" );
			expect( story.nearestPointAverage ).toStrictEqual( "coffee" );
		} );

		it( "shows ? for any value being ?", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );
			membersManager.addMember( "member3", "Member 3" );

			pokerStoryHandler.castVote( "member2", "?" );

			pokerStoryHandler.recalculate();

			const story = pokerStoryHandler.getStory();

			expect( story.voteAverage ).toStrictEqual( "?" );
			expect( story.nearestPointAverage ).toStrictEqual( "?" );
		} );

		it( "calculates correct average", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );
			membersManager.addMember( "member3", "Member 3" );

			pokerStoryHandler.castVote( "member1", 1 );
			pokerStoryHandler.castVote( "member2", 2 );
			pokerStoryHandler.castVote( "member2", 5 );
			// Not voting for member 3.

			pokerStoryHandler.recalculate();

			const story = pokerStoryHandler.getStory();

			expect( story.voteAverage ).toStrictEqual( 3 );
		} );

		it( "calculates correct average", () => {
			membersManager.addMember( "member1", "Member 1" );
			membersManager.addMember( "member2", "Member 2" );
			membersManager.addMember( "member3", "Member 3" );

			pokerStoryHandler.castVote( "member1", 0.5 );
			pokerStoryHandler.castVote( "member2", 2 );
			pokerStoryHandler.castVote( "member3", 13 );
			// Not voting for member 3.

			pokerStoryHandler.recalculate();

			const story = pokerStoryHandler.getStory();

			expect( story.nearestPointAverage ).toStrictEqual( 8 );
		} );
	} );
} );
