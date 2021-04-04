import PokerMemberManager, { Member } from "../../src/services/PokerMemberManager";

describe( "PokerMemberManager", () => {
	let pokerMemberManager: PokerMemberManager;

	beforeEach( () => {
		pokerMemberManager = new PokerMemberManager();
	} );

	describe( "addMember", () => {
		it( "adds an active member to the list", () => {
			const expected: Member = {
				id: "1",
				name: "name",
				type: "voter",
				connected: true,
			};

			pokerMemberManager.addMember( "1", "name" );

			expect( pokerMemberManager.getMembers() ).toStrictEqual( { 1: expected } );
			expect( pokerMemberManager.getVoters() ).toStrictEqual( [ expected ] );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 1 );
			expect( pokerMemberManager.getClientCount() ).toStrictEqual( 1 );
		} );
	} );

	describe( "setMemberName", () => {
		it( "sets the name of a member", () => {
			const expected: Member = {
				id: "1",
				name: "new-name",
				type: "voter",
				connected: true,
			};

			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.setMemberName( "1", "new-name" );

			expect( pokerMemberManager.getVoters() ).toStrictEqual( [ expected ] );
		} );
	} );

	describe( "removeMember", () => {
		it( "removes a member from the list", () => {
			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.removeMember( "1" );

			expect( pokerMemberManager.getMembers() ).toStrictEqual( {} );
			expect( pokerMemberManager.getVoters() ).toStrictEqual( [] );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 0 );
			expect( pokerMemberManager.getClientCount() ).toStrictEqual( 0 );
		} );
	} );

	describe( "disconnectMember", () => {
		it( "registers a member as disconnected", () => {
			const expected: Member = {
				id: "1",
				name: "name",
				type: "voter",
				connected: false,
				disconnectTime: Date.now(),
			};

			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.setDisconnected( "1" );

			expect( pokerMemberManager.getMembers() ).toStrictEqual( { 1: expected } );
			expect( pokerMemberManager.getVoters() ).toStrictEqual( [] );
			expect( pokerMemberManager.getDisconnected() ).toStrictEqual( [ expected ] );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 0 );
			expect( pokerMemberManager.getClientCount( false ) ).toStrictEqual( 0 );
			expect( pokerMemberManager.getClientCount( true ) ).toStrictEqual( 1 );
		} );
	} );

	describe( "makeObserver", () => {
		it( "sets a member as observer", () => {
			const expected: Member = {
				id: "1",
				name: "name",
				type: "observer",
				connected: true,
			};

			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.makeObserver( "1" );

			expect( pokerMemberManager.getMembers() ).toStrictEqual( { 1: expected } );
			expect( pokerMemberManager.getVoters() ).toStrictEqual( [] );
			expect( pokerMemberManager.getObservers() ).toStrictEqual( [ expected ] );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 0 );
			expect( pokerMemberManager.getClientCount() ).toStrictEqual( 1 );
		} );
	} );
} );
