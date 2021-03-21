import { Interval } from "@nestjs/schedule";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import PointsService from "../services/points.service";
import { Vote } from "../services/poker.story.service";
import PokersService from "../services/pokers.service";
import HistoryResponseAdapter from "../adapters/history.response.adapter";
import MembersResponseAdapter from "../adapters/members.response.adapter";
import VoteResponseAdapter from "../adapters/vote.response.adapter";

@WebSocketGateway( { namespace: "/pokers" } )
/**
 * The pokers gateway.
 */
export default class PokersGateway implements OnGatewayInit {
	@WebSocketServer() server: Server;

	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	constructor(
		private readonly pokersService: PokersService,
		private readonly voteResponseAdapter: VoteResponseAdapter,
		private readonly historyResponseAdapter: HistoryResponseAdapter,
		private readonly membersResponseAdapter: MembersResponseAdapter,
	) {}

	@Interval(30000)
	handleInterval() {
  		const changedRooms = this.pokersService.cleanupMembers();
		changedRooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
	}

	/**
	 * When the connection is initialized, run setup for the client socket.
	 *
	 * @returns {void}
	 */
	afterInit(): void {
		this.server.on( "connection", ( socket ) => {
			// Let the client know the points that can be chosen from.
			socket.emit( "userId", this.generateId() );
			socket.emit( "points", PointsService.getPoints() );

			socket.on( "disconnecting", () => {
				for ( const room in socket.rooms ) {
					if ( ! socket.rooms[ room ] ) {
						continue;
					}
					if ( room.includes( "/pokers#" ) ) {
						continue;
					}

					this.pokersService.disconnect( socket, room );
					this.send( room, { members: true, votes: true } );
				}
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
		this.pokersService.identify( client, message.id );
		client.emit( "welcome" );
	}

	@SubscribeMessage( "exit" )
	exit( client: Socket ): void {
		this.pokersService.exit( client );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { poker: string; name?: string } ): void {
		this.pokersService.join( client, message.poker, message.name );

		client.emit( "joined", { poker: message.poker } );

		const story = this.pokersService.getStory( message.poker );
		client.emit( "story", story.name );

		const vote = this.pokersService.getVote( client, message.poker );
		if ( vote ) {
			client.emit( "myVote", { currentVote: vote.currentValue, initialVote: vote.initialValue } );
		}

		this.send( message.poker, { members: true, votes: true, history: true } );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { poker: string } ): void {
		this.pokersService.leave( client, message.poker );

		this.send( message.poker, { members: true, votes: true } );
	}

	@SubscribeMessage( "vote" )
	vote( client: Socket, message: { poker: string; vote: Vote } ): void {
		this.pokersService.castVote( client, message.poker, message.vote );

		// Send this vote to all sockets for the current user.
		const vote      = this.pokersService.getVote( client, message.poker );
		const socketIds = this.pokersService.getUserSockets( this.pokersService.getUserId( client ) );

		for ( const socketId of socketIds ) {
			if ( this.server.sockets[ socketId ] ) {
				this.server.sockets[ socketId ].emit( "myVote", { currentVote: vote.currentValue, initialVote: vote.initialValue } );
			}
		}

		this.send( message.poker, { votes: true } );
	}

	@SubscribeMessage( "finish" )
	finish( client: Socket, message: { poker: string } ): void {
		this.server.to( message.poker ).emit( "finished" );
	}

	@SubscribeMessage( "nickname" )
	setNickname( client: Socket, message: { name: string; poker: string } ): void {
		this.pokersService.setName( message.poker, client, message.name );

		this.send( message.poker, { members: true, votes: true } );
	}

	@SubscribeMessage( "newStory" )
	newStory( client: Socket, message: { poker: string } ): void {
		this.pokersService.newStory( message.poker );

		this.send( message.poker, { story: true, votes: true, history: true } );
	}

	@SubscribeMessage( "changeStoryName" )
	story( client: Socket, message: { poker: string; name: string } ): void {
		this.pokersService.setStoryName( message.poker, message.name );

		this.send( message.poker, { story: true } );
	}

	@SubscribeMessage( "popHistory" )
	popHistory( client: Socket, message: { poker: string } ): void {
		this.pokersService.removeLastHistoryEntry( message.poker );

		this.send( message.poker, { history: true } );
	}

	@SubscribeMessage( "resetHistory" )
	resetHistory( client: Socket, message: { poker: string } ): void {
		this.pokersService.resetHistory( message.poker );

		this.send( message.poker, { history: true } );
	}

	@SubscribeMessage( "observe" )
	observer( client: Socket, message: { poker: string } ): void {
		this.pokersService.observe( client, message.poker );

		this.send( message.poker, { votes: true, members: true } );
	}

	@SubscribeMessage( "toggleRevealVotes" )
	toggleRevealVotes( client: Socket, message: { poker: string } ): void {
		this.pokersService.toggleRevealVotes( message.poker );

		this.send( message.poker, { votes: true } );
	}
	/* eslint-enable require-jsdoc */

	/**
	 * Sends data to all members in the room.
	 *
	 * @param {string} poker    The room to send to.
	 * @param {object} settings Which data to send.
	 *
	 * @returns {void}
	 */
	private send( poker: string, {
		story = false,
		votes = false,
		members = false,
		history = false,
		all = false,
	} = {} ) {
		if ( all || story ) {
			this.server.to( poker ).emit( "story", this.pokersService.getStory( poker ).name );
		}

		if ( all || members ) {
			this.server.to( poker ).emit( "memberList", this.membersResponseAdapter.format( poker ) );
		}

		if ( all || votes ) {
			this.server.to( poker ).emit( "votes", this.voteResponseAdapter.format( poker ) );
		}

		if ( all || history ) {
			this.server.to( poker ).emit( "history", this.historyResponseAdapter.format( poker ) );
		}
	}
}
