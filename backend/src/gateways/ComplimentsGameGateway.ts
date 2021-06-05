import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

@WebSocketGateway( { namespace: "/compliments-game" } )
/**
 * The rooms gateway.
 */
export default class ComplimentsGameGateway implements OnGatewayInit {
	@WebSocketServer() server: Server;

	/**
	 * Constructor
	 */
	constructor() {}

	/**
	 * When the connection is initialized, run setup for the client socket.
	 *
	 * @returns {void}
	 */
	afterInit(): void {
		this.server.on( "connection", ( socket: Socket ) => {
			// Let the client know the points that can be chosen from.
			socket.emit( "userId", this.generateId() );
			// socket.emit( "cards", this.cardsProvider.getCards() );

			socket.on( "disconnecting", () => {
				// const rooms = this.cardsGameService.disconnect( socket );
				// rooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
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
		// this.cardsGameService.identify( client, message.id );
		client.emit( "welcome" );
	}

	@SubscribeMessage( "exit" )
	exit( client: Socket ): void {
		console.log( "exit", client.id );
		// const rooms = this.cardsGameService.exit( client );
		// rooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { room: string; name?: string } ): void {
		console.log( "join", client.id, message );
		// this.cardsGameService.join( client, message.room, message.name );

		client.emit( "joined", message.room );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { room: string } ): void {
		// this.cardsGameService.leave( client, message.room );

		// this.send( message.room, { members: true, votes: true } );
	}

	// @SubscribeMessage( "finish" )
	// finish( client: Socket, message: { room: string } ): void {
	// 	console.log( "finish", message, client.id );
	// 	this.server.to( message.room ).emit( "finished" );
	// }

	@SubscribeMessage( "nickname" )
	setNickname( client: Socket, message: { name: string; room: string } ): void {
		console.log( "nickname", message );
		// this.cardsGameService.setName( message.room, client, message.name );

		// this.send( message.room, { members: true, votes: true } );
	}
	/* eslint-enable require-jsdoc */
}
