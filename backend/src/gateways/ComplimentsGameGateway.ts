import { Interval } from "@nestjs/schedule";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import CardsProvider from "../services/ComplimentsGame/CardsProvider";
import GameCleanupService from "../services/ComplimentsGame/GameCleanupService";
import GameService from "../services/ComplimentsGame/GameService";

@WebSocketGateway( { namespace: "/compliments-game" } )
/**
 * The rooms gateway.
 */
export default class ComplimentsGameGateway implements OnGatewayInit {
	@WebSocketServer() server: Server;

	/**
	 * Constructor
	 *
	 * @param {PokersService} gameService The Poker service.
	 * @param {PointsProvider} cardsProvider The points provider service.
	 * @param {PokersCleanupService} cleanupService The Poker cleanup service.
	 */
	constructor(
		private readonly gameService: GameService,
		private readonly cardsProvider: CardsProvider,
		private readonly cleanupService: GameCleanupService,
	) {
	}

	/**
	 * Clean up the rooms periodically.
	 *
	 * @returns {void}
	 */
	@Interval( 10000 )
	cleanupInterval(): void {
		const changedRooms = this.cleanupService.cleanup();
		// changedRooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
	}

	/**
	 * When the connection is initialized, run setup for the client socket.
	 *
	 * @returns {void}
	 */
	afterInit(): void {
		this.server.on( "connection", ( socket: Socket ) => {
			// Let the client know the points that can be chosen from.
			socket.emit( "userId", this.generateId() );

			socket.on( "disconnecting", () => {
				const rooms = this.gameService.disconnect( socket );
				rooms.map( ( room: string ) => this.update( room ) );
			} );
		} );
	}

	/**
	 * Generates a user Id.
	 *
	 * @returns {string} User Id.
	 *
	 * @private
	 */
	private generateId(): string {
		return (
			Date.now().toString( 36 ) + Math.random().toString( 36 ).substr( 2, 5 )
		).toUpperCase();
	}

	/* eslint-disable require-jsdoc */
	@SubscribeMessage( "identify" )
	identify( client: Socket, message: { id: string } ): void {
		console.log( "identify", client.id, message );
		this.gameService.identify( client, message.id );
		client.emit( "welcome" );
	}

	@SubscribeMessage( "exit" )
	exit( client: Socket ): void {
		console.log( "exit", client.id );
		const rooms = this.gameService.exit( client );
		rooms.map( ( room: string ) => this.update( room ) );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { room: string; name?: string } ): void {
		console.log( "join", client.id, message );
		this.gameService.join( client, message.room, message.name );

		client.emit( "joined", message.room );

		this.update( message.room );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { room: string } ): void {
		this.gameService.leave( client, message.room );

		this.update( message.room );
	}

	// @SubscribeMessage( "finish" )
	// Finish( client: Socket, message: { room: string } ): void {
	// 	Console.log( "finish", message, client.id );
	// 	This.server.to( message.room ).emit( "finished" );
	// }

	@SubscribeMessage( "nickname" )
	setNickname( client: Socket, message: { name: string; room: string } ): void {
		console.log( "nickname", message );
		this.gameService.setName( message.room, client, message.name );

		this.update( message.room );
	}
	/* eslint-enable require-jsdoc */

	/**
	 *
	 * @param {string} room
	 * @private
	 */
	private update( room: string ) {
		this.server.to( room ).emit( "game", this.gameService.getGame( room ) );
	}
}
