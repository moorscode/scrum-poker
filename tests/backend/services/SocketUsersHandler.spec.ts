import { Socket } from "socket.io";
import SocketUserHandler from "../../../backend/src/services/SocketUsersHandler";

describe( "SocketUserHandler", () => {
	let socketUserHandler: SocketUserHandler;

	beforeEach( () => {
		socketUserHandler = new SocketUserHandler();
	} );

	describe( "add", () => {
		it( "registers a socket - memberId pair", () => {
			const socket = {} as unknown as Socket;

			socketUserHandler.add( socket, "1" );

			expect( socketUserHandler.getMemberId( socket ) ).toStrictEqual( "1" );
			expect( socketUserHandler.getMemberIds() ).toStrictEqual( [ "1" ] );
		} );
	} );

	describe( "remove", () => {
		it( "removes a socket - memberId pair", () => {
			const socket = { id: "socket-id" } as unknown as Socket;

			socketUserHandler.add( socket, "1" );
			socketUserHandler.remove( "socket-id" );

			expect( socketUserHandler.getMemberIds() ).toStrictEqual( [] );
		} );
	} );

	describe( "getUserSockets", () => {
		it( "retrieves all sockets for a specific memberId", () => {
			const socket = { id: "socket 1" } as unknown as Socket;
			const socket2 = { id: "socket 2" } as unknown as Socket;
			const socket3 = { id: "socket 3" } as unknown as Socket;

			socketUserHandler.add( socket, "1" );
			socketUserHandler.add( socket2, "1" );
			socketUserHandler.add( socket3, "2" );

			expect( socketUserHandler.getUserSockets( "1" ) ).toStrictEqual( [ socket, socket2 ] );
		} );
	} );
} );
