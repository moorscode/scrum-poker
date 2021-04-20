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

		it( "dispatches a member added event", () => {
			const callback = jest.fn();

			pokerMemberManager.on( "member-added", callback );
			pokerMemberManager.addMember( "1", "name" );

			expect( callback ).toHaveBeenCalledWith( "1" );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( "dispatches a member status changed event", () => {
			const callback = jest.fn();

			pokerMemberManager.on( "member-state", callback );
			pokerMemberManager.addMember( "1", "name" );

			expect( callback ).toHaveBeenCalledWith( { from: "", to: "voter", id: "1" } );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( "dispatches a member status changed event after adding a disconnected member", () => {
			const callback = jest.fn();

			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.setDisconnected( "1" );

			pokerMemberManager.on( "member-state", callback );
			pokerMemberManager.addMember( "1", "name" );

			expect( callback ).toHaveBeenCalledWith( { from: "disconnected", to: "voter", id: "1" } );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( "dispatches a member status changed event after adding an observing member", () => {
			const callback = jest.fn();

			pokerMemberManager.addMember( "1", "name" );
			pokerMemberManager.makeObserver( "1" );

			pokerMemberManager.on( "member-state", callback );
			pokerMemberManager.addMember( "1", "name" );

			expect( callback ).toHaveBeenCalledWith( { from: "observer", to: "voter", id: "1" } );
			expect( callback ).toHaveBeenCalledTimes( 1 );
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

		it( "dispatches a member status changed event", () => {
			const callback = jest.fn();

			pokerMemberManager.addMember( "1", "name" );

			pokerMemberManager.on( "member-removed", callback );
			pokerMemberManager.removeMember( "1" );

			expect( callback ).toHaveBeenCalledWith( "1" );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );
	} );

	describe( "setDisconnected", () => {
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

		it( "dispatches a member status changed event", () => {
			const callback = jest.fn();

			pokerMemberManager.addMember( "1", "name" );

			pokerMemberManager.on( "member-state", callback );
			pokerMemberManager.setDisconnected( "1" );

			expect( callback ).toHaveBeenCalledWith( { from: "voter", to: "disconnected", id: "1" } );
			expect( callback ).toHaveBeenCalledTimes( 1 );
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

		it( "dispatches a member status changed event", () => {
			const callback = jest.fn();

			pokerMemberManager.addMember( "1", "name" );

			pokerMemberManager.on( "member-state", callback );
			pokerMemberManager.makeObserver( "1" );

			expect( callback ).toHaveBeenCalledWith( { from: "voter", to: "observer", id: "1" } );
			expect( callback ).toHaveBeenCalledTimes( 1 );
		} );

		it( "dispatches a member removed event", () => {
			const callback = jest.fn();

			pokerMemberManager.addMember( "1", "name" );

			pokerMemberManager.on( "member-removed", callback );
			pokerMemberManager.makeObserver( "1" );

			expect( callback ).toHaveBeenCalledWith( "1" );
			expect( callback ).toHaveBeenCalledTimes( 1 );
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
