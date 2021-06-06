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
		changedRooms.map( ( room: string ) => this.update( room ) );
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
		this.gameService.identify( client, message.id );
		client.emit( "welcome" );
	}

	@SubscribeMessage( "exit" )
	exit( client: Socket ): void {
		const rooms = this.gameService.exit( client );
		rooms.map( ( room: string ) => this.update( room ) );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { room: string; name?: string } ): void {
		this.gameService.join( client, message.room, message.name );

		client.emit( "joined", message.room );

		this.update( message.room );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { room: string } ): void {
		this.gameService.leave( client, message.room );

		this.update( message.room );
	}

	@SubscribeMessage( "nickname" )
	setNickname( client: Socket, message: { name: string; room: string } ): void {
		this.gameService.setName( message.room, client, message.name );

		this.update( message.room );
	}

	@SubscribeMessage( "start" )
	start( client: Socket, message: { room: string } ): void {
		this.gameService.startGame( message.room );

		this.update( message.room );
	}

	@SubscribeMessage( "pick" )
	pick( client: Socket, message: { room: string, card: string, to: string } ): void {
		this.server.to( message.room ).emit( "picked", {
			from: this.gameService.getUserId( client ),
			card: this.gameService.getCard( message.room, message.card ),
			to: message.to,
		} );
	}

	@SubscribeMessage( "give" )
	give( client: Socket, message: { room: string, card: string, to: string } ): void {
		this.gameService.giveCard( message.room, client, message.card, message.to );

		this.update( message.room );
	}

	@SubscribeMessage( "vote-skip" )
	skip( client: Socket, message: { room: string } ): void {
		this.gameService.voteSkip( message.room );

		this.update( message.room );
	}
	/* eslint-enable require-jsdoc */

	/**
	 * Updates a room.
	 *
	 * @param {string} room The room to update.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private update( room: string ): void {
		this.server.to( room ).emit( "members", this.gameService.getMembers( room ) );
		this.server.to( room ).emit( "game", this.gameService.getGame( room ) );
		this.server.to( room ).emit( "turn", this.gameService.getTurnMemberId( room ) );
	}
}
