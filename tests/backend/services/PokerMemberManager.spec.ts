import PokerMemberManager from "../../../backend/src/services/PokerMemberManager";

describe( "PokerMemberManager", () => {
	let pokerMemberManager: PokerMemberManager;

	beforeEach( () => {
		pokerMemberManager = new PokerMemberManager();
	} );

	describe( "addMember", () => {
		it( "adds an active member to the list", () => {
			pokerMemberManager.addMember( "1", "name" );

			expect( pokerMemberManager.getMember( "1" ) ).toHaveProperty( "id", "1" );

			expect( pokerMemberManager.getVoters() ).toHaveLength( 1 );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 1 );
			expect( pokerMemberManager.getClientCount() ).toStrictEqual( 1 );
		} );
	} );

	describe( "setMemberName", () => {
		it( "sets the name of a member", () => {
			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.setMemberName( "1", "new-name" );

			expect( pokerMemberManager.getVoters() ).toHaveLength( 1 );
			expect( pokerMemberManager.getMember( "1" ) ).toHaveProperty( "name", "new-name" );
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
			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.setDisconnected( "1" );

			expect( pokerMemberManager.getMember( "1" ) ).toHaveProperty( "connected", false );
			expect( pokerMemberManager.getMember( "1" ) ).toHaveProperty( "disconnectTime", Date.now() );

			expect( pokerMemberManager.getVoters() ).toHaveLength( 0 );
			expect( pokerMemberManager.getDisconnected() ).toHaveLength( 1 );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 0 );

			expect( pokerMemberManager.getClientCount( false ) ).toStrictEqual( 0 );
			expect( pokerMemberManager.getClientCount( true ) ).toStrictEqual( 1 );
		} );

		it( "does nothing for an unknown member", () => {
			pokerMemberManager.setDisconnected( "2" );

			expect( pokerMemberManager.getMember( "2" ) ).toHaveProperty( "type", "invalid" );
			expect( pokerMemberManager.getMember( "2" ) ).not.toHaveProperty( "disconnectTime" );
		} );
	} );

	describe( "makeObserver", () => {
		it( "sets a member as observer", () => {
			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.makeObserver( "1" );

			expect( pokerMemberManager.getMember( "1" ) ).toHaveProperty( "type", "observer" );

			expect( pokerMemberManager.getVoters() ).toHaveLength( 0 );
			expect( pokerMemberManager.getObservers() ).toHaveLength( 1 );
			expect( pokerMemberManager.getVoterCount() ).toStrictEqual( 0 );
			expect( pokerMemberManager.getClientCount() ).toStrictEqual( 1 );
		} );

		it( "does nothing for an unknown member", () => {
			pokerMemberManager.makeObserver( "2" );

			expect( pokerMemberManager.getMember( "2" ) ).toHaveProperty( "type", "invalid" );
		} );
	} );

	describe( "getMember", () => {
		it( "returns an invalid member for an unknown ID", () => {
			const result = pokerMemberManager.getMember( "123" );

			expect( result ).toHaveProperty( "name", "Invalid" );
			expect( result ).toHaveProperty( "id", "0" );
			expect( result ).toHaveProperty( "type", "invalid" );
			expect( result ).toHaveProperty( "connected", false );
		} );
	} );
} );
