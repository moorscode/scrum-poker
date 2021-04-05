import PokersCleanupService from "../../../backend/src/services/PokersCleanupService";
import { Test } from "@nestjs/testing";
import PokersService from "../../../backend/src/services/PokersService";
import PointsProvider from "../../../backend/src/services/PointsProvider";
import SocketUsersService from "../../../backend/src/services/SocketUsersHandler";
import { Socket } from "socket.io";
import now from "../../bootstrap";

describe( "PokersCleanupService", () => {
	let pokersCleanupService: PokersCleanupService;
	let pokersService: PokersService;

	beforeEach( async () => {
		const module = await Test.createTestingModule( {
			providers: [
				PokersCleanupService,
				PokersService,
				PointsProvider,
				SocketUsersService,
			],
		} ).compile();

		pokersCleanupService = module.get<PokersCleanupService>( PokersCleanupService );
		pokersService = module.get<PokersService>( PokersService );
	} );

	describe( "cleanup", () => {
		it( "removes empty rooms", () => {
			const socket: Socket = {
				id: "socket",
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const getRooms = jest.spyOn( pokersService, "getRooms" );

			pokersService.join( socket, "room", "name" );
			pokersService.leave( socket, "room" );

			const rooms = pokersService.getRooms();

			expect( Object.keys( rooms ) ).toHaveLength( 1 );

			pokersCleanupService.cleanup();

			const result = pokersService.getRooms();

			expect( getRooms ).toHaveBeenCalled();
			expect( Object.keys( result ) ).toHaveLength( 0 );
		} );

		it( "removes users that have timed out", () => {
			const socket: Socket = {
				id: "socket",
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			const socket2: Socket = {
				id: "socket2",
				join: jest.fn(),
				leave: jest.fn(),
			} as unknown as Socket;

			pokersService.identify( socket, "user1" );
			pokersService.join( socket, "room", "name" );

			pokersService.identify( socket2, "user2" );
			pokersService.join( socket2, "room", "name" );

			// Set first member to be disconnected.
			pokersService.disconnect( socket, "room" );

			const rooms = pokersService.getRooms();

			expect( Object.keys( rooms ) ).toHaveLength( 1 );

			// Pretend we've moved 60 seconds in the future.
			Date.now = jest.fn().mockReturnValue( now + 60000 );

			const changedRooms = pokersCleanupService.cleanup();

			expect( Object.keys( pokersService.getRooms() ) ).toHaveLength( 1 );

			expect( changedRooms ).toStrictEqual( [ "room" ] );
		} );
	} );
} );
