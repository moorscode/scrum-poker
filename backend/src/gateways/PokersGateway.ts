import { Interval } from "@nestjs/schedule";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import PointsProvider from "../services/PointsProvider";
import { Vote } from "../services/PokerStoryHandler";
import PokersService from "../services/PokersService";
import HistoryResponseAdapter from "../adapters/HistoryResponseAdapter";
import MembersResponseAdapter from "../adapters/MembersResponseAdapter";
import VoteResponseAdapter from "../adapters/VoteResponseAdapter";
import PokersCleanupService from "../services/PokersCleanupService";

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
	 * @param {PointsProvider} pointsProvider The points provider service.
	 * @param {PokersCleanupService} pokersCleanupService The Poker cleanup service.
	 * @param {VoteResponseAdapter} voteResponseAdapter The Vote response Adapter.
	 * @param {HistoryResponseAdapter} historyResponseAdapter The History response Adapter.
	 * @param {MembersResponseAdapter} membersResponseAdapter The Members response Adapter.
	 */
	constructor(
		private readonly pokersService: PokersService,
		private readonly pointsProvider: PointsProvider,
		private readonly pokersCleanupService: PokersCleanupService,
		private readonly voteResponseAdapter: VoteResponseAdapter,
		private readonly historyResponseAdapter: HistoryResponseAdapter,
		private readonly membersResponseAdapter: MembersResponseAdapter,
	) {}

	/**
	 * Clean up the rooms periodically.
	 *
	 * @returns {void}
	 */
	@Interval( 1000 )
	cleanupInterval(): void {
		const changedRooms = this.pokersCleanupService.cleanup();
		changedRooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
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
			socket.emit( "points", this.pointsProvider.getPoints() );

			socket.on( "disconnecting", () => {
				for ( const room in socket.rooms ) {
					if ( room === socket.id ) {
						continue;
					}

					if ( ! socket.rooms[ room ] ) {
						continue;
					}

					this.pokersService.disconnect( socket, room );
					this.send( room, { members: true, votes: true } );
				}
			} );

			socket.on( "disconnect", () => {
				this.pokersService.exit( socket );
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
	exit( client: Socket, message: { room: string } ): void {
		this.pokersService.exit( client );

		this.send( message.room, { members: true, votes: true } );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { poker: string; name?: string } ): void {
		this.pokersService.join( client, message.poker, message.name );

		client.emit( "joined", message.poker );

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
			this.server.to( poker ).emit(
				"story",
				this.pokersService.getStory( poker ).name,
			);
		}

		if ( all || members ) {
			this.server.to( poker ).emit(
				"memberList",
				this.membersResponseAdapter.format(
					this.pokersService.getGroupedMembers( poker ),
				),
			);
		}

		if ( all || votes ) {
			this.server.to( poker ).emit(
				"votes",
				this.voteResponseAdapter.format(
					this.pokersService.getVotes( poker ),
					this.pokersService.getVotedNames( poker ),
					this.pokersService.getStory( poker ),
				),
			);
		}

		if ( all || history ) {
			this.server.to( poker ).emit(
				"history",
				this.historyResponseAdapter.format(
					this.pokersService.getHistory( poker ),
				),
			);
		}
	}
}
