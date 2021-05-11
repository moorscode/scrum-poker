import { Test } from "@nestjs/testing";
import { Socket } from "socket.io";
import PointsProvider from "../../../backend/src/services/PointsProvider";
import PokersService from "../../../backend/src/services/PokersService";
import SocketUserHandler from "../../../backend/src/services/SocketUsersHandler";

describe( "PokersService", () => {
	let pokersService: PokersService;
	let socketUsersService: SocketUserHandler;

	beforeEach( async () => {
		const module = await Test.createTestingModule( {
			providers: [
				PokersService,
				PointsProvider,
				SocketUserHandler,
			],
		} ).compile();

		socketUsersService = module.get<SocketUserHandler>( SocketUserHandler );
		pokersService = module.get<PokersService>( PokersService );
	} );

	describe( "exit", () => {
		it( "returns the rooms a socket is in", () => {
			const socket: Socket = {
				id: "socket",
				rooms: { room: "room" },
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const remove = jest.spyOn( socketUsersService, "remove" );

			pokersService.identify( socket, "userid" );
			pokersService.join( socket, "room", "name" );

			const result = pokersService.exit( socket );
			expect( result ).toStrictEqual( [ "room" ] );

			const members = pokersService.getGroupedMembers( "room" );
			expect( members.voters ).toHaveLength( 0 );

			expect( remove ).toBeCalledWith( socket );
			expect( remove ).toBeCalledTimes( 1 );
		} );

		it( "does nothing if a user is not known", () => {
			const socket: Socket = {
				id: "socket",
				rooms: { room: "room" },
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const result = pokersService.exit( socket );

			expect( result ).toStrictEqual( [] );
		} );

		it( "returns no room if a userid is still in the room", () => {
			const socket: Socket = {
				id: "socket",
				rooms: { room: "room" },
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const socket2: Socket = {
				id: "socket2",
				rooms: { room: "room" },
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			pokersService.identify( socket, "userid" );
			pokersService.identify( socket2, "userid" );

			pokersService.join( socket, "room", "name" );
			pokersService.join( socket2, "room", "name" );

			const result = pokersService.exit( socket );

			expect( result ).toStrictEqual( [] );
		} );
	} );

	describe( "disconnect", () => {
		it( "disconnects a user from a room", () => {
			const socket: Socket = {
				id: "socket",
				rooms: { room: "room" },
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const remove = jest.spyOn( socketUsersService, "remove" );

			pokersService.identify( socket, "userid" );
			pokersService.join( socket, "room", "name" );

			const result  = pokersService.disconnect( socket );
			expect( result ).toStrictEqual( [ "room" ] );

			const members = pokersService.getGroupedMembers( "room" );
			expect( members.disconnected ).toHaveLength( 1 );
			expect( members.disconnected[ 0 ].id ).toStrictEqual( "userid" );

			expect( remove ).toBeCalledWith( socket );
			expect( remove ).toBeCalledTimes( 1 );
		} );

		it( "does nothing if a user is not known", () => {
			const socket: Socket = {
				id: "socket",
				rooms: { room: "room" },
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const result = pokersService.disconnect( socket );
			expect( result ).toStrictEqual( [] );
		} );
	} );
} );
