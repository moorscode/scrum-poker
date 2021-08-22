import { Interval } from "@nestjs/schedule";
import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import HistoryResponseAdapter from "../adapters/HistoryResponseAdapter";
import MembersResponseAdapter from "../adapters/MembersResponseAdapter";
import VoteResponseAdapter from "../adapters/VoteResponseAdapter";
import PokersCleanupService from "../services/PokersCleanupService";
import PokersService from "../services/PokersService";
import { Vote } from "../services/PokerStoryHandler";
import PointProviderFactory from "../services/voting/PointProviderFactory";
import { VotingSystem } from "../services/voting/VotingSystem";

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
	 * @param {PointProviderFactory} pointProviderFactory The points provider factory service.
	 * @param {PokersCleanupService} pokersCleanupService The Poker cleanup service.
	 * @param {VoteResponseAdapter} voteResponseAdapter The Vote response Adapter.
	 * @param {HistoryResponseAdapter} historyResponseAdapter The History response Adapter.
	 * @param {MembersResponseAdapter} membersResponseAdapter The Members response Adapter.
	 */
	constructor(
		private readonly pokersService: PokersService,
		private readonly pointProviderFactory: PointProviderFactory,
		private readonly pokersCleanupService: PokersCleanupService,
		private readonly voteResponseAdapter: VoteResponseAdapter,
		private readonly historyResponseAdapter: HistoryResponseAdapter,
		private readonly membersResponseAdapter: MembersResponseAdapter,
	) {
	}

	/**
	 * Clean up the rooms periodically.
	 *
	 * @returns {void}
	 */
	@Interval( 10000 )
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

			socket.on( "disconnecting", () => {
				const rooms = this.pokersService.disconnect( socket );
				rooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
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
		const rooms = this.pokersService.exit( client );

		rooms.map( ( room: string ) => this.send( room, { members: true, votes: true } ) );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { poker: string; name?: string } ): void {
		this.pokersService.join( client, message.poker, message.name );

		client.emit( "joined", message.poker );

		const vote = this.pokersService.getVote( client, message.poker );
		if ( vote ) {
			client.emit( "myVote", { currentVote: vote.currentValue, initialVote: vote.initialValue } );
		}

		this.send( message.poker, { story: true, points: true, members: true, votes: true, history: true } );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { poker: string } ): void {
		this.pokersService.leave( client, message.poker );

		this.send( message.poker, { members: true, votes: true } );
	}

	@SubscribeMessage( "vote" )
	vote( client: Socket, message: { poker: string; vote: Vote } ): void {
		this.pokersService.castVote( client, message.poker, message.vote );

		this.send( message.poker, { votes: true } );

		// Send this vote to all sockets for the current user.
		const vote = this.pokersService.getVote( client, message.poker );
		const sockets = this.pokersService.getUserSockets( this.pokersService.getUserId( client ) );

		for ( const socket of sockets ) {
			if ( socket ) {
				socket.emit( "myVote", { currentVote: vote.currentValue, initialVote: vote.initialValue } );
			}
		}
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

	@SubscribeMessage( "setVotingSystem" )
	setVotingSystem( client: Socket, message: { poker: string, votingSystem: VotingSystem } ): void {
		this.pokersService.setStoryVotingSystem( message.poker, message.votingSystem );
		this.send( message.poker, { story: true, points: true, votes: true } );
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

	/* eslint-disable complexity */
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
		points = false,
		all = false,
	} = {} ) {
		// Don't send stuff to rooms that are cleaned up.
		const rooms = Object.keys( this.pokersService.getRooms() );
		if ( ! rooms.includes( poker ) ) {
			return;
		}

		if ( all || story ) {
			this.sendStory( poker );
		}

		if ( all || members ) {
			this.sendMembers( poker );
		}

		if ( all || votes ) {
			this.sendVotes( poker );
		}

		if ( all || history ) {
			this.sendHistory( poker );
		}

		if ( all || points ) {
			this.sendPoints( poker );
		}
	}
	/* eslint-enable complexity */

	/**
	 * Sends the points to all members in the room.
	 *
	 * @param {string} poker The room to send to.
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	private sendPoints( poker: string ) {
		this.server.to( poker ).emit(
			"points",
			this.pointProviderFactory.getPointProvider( this.pokersService.getStory( poker ).votingSystem ).getPoints(),
		);
	}

	/**
	 * Sends the history to all members in the room.
	 *
	 * @param {string} poker The room to send to.
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	private sendHistory( poker: string ) {
		this.server.to( poker ).emit(
			"history",
			this.historyResponseAdapter.format(
				this.pokersService.getHistory( poker ),
			),
		);
	}

	/**
	 * Sends the votes to all members in the room.
	 *
	 * @param {string} poker The room to send to.
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	private sendVotes( poker: string ) {
		this.server.to( poker ).emit(
			"votes",
			this.voteResponseAdapter.format(
				this.pokersService.getVotes( poker ),
				this.pokersService.getVotedNames( poker ),
				this.pokersService.getStory( poker ),
			),
		);
	}

	/**
	 * Sends the members to all members in the room.
	 *
	 * @param {string} poker The room to send to.
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	private sendMembers( poker: string ) {
		this.server.to( poker ).emit(
			"memberList",
			this.membersResponseAdapter.format(
				this.pokersService.getGroupedMembers( poker ),
			),
		);
	}

	/**
	 * Sends the story to all members in the room.
	 *
	 * @param {string} poker The room to send to.
	 *
	 * @private
	 *
	 * @returns {void}
	 */
	private sendStory( poker: string ) {
		const currentStory = this.pokersService.getStory( poker );
		this.server.to( poker ).emit(
			"story",
			{
				name: currentStory.name,
				votingSystem: currentStory.votingSystem,
			} );
	}
}
