import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// eslint-disable-next-line camelcase
import { var_export } from "locutus/php/var";
import { Server, Socket } from "socket.io";
import { PointsService } from "../points/points.service";
import { Client, MemberList, Story, Vote, VoteValue } from "./poker-room";
import { PokersService } from "./pokers.service";

interface ClientResponse {
	name: string;
	id: string;
}

interface VoteResponse {
	voterName: string;
	currentValue: VoteValue;
	initialValue: VoteValue;
}

interface StoryResponse {
	name: string;
	voteAverage?: number | string;
	nearestPointAverage?: VoteValue;
	votes: VoteResponse[];
	votesRevealed: boolean;
}

interface MembersResponse {
	voters: ClientResponse[];
	observers: ClientResponse[];
	disconnected: ClientResponse[];
}

@WebSocketGateway( { namespace: "/pokers" } )
/**
 * The pokers gateway.
 */
export class PokersGateway implements OnGatewayInit {
	@WebSocketServer() server: Server;

	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	constructor( private readonly pokersService: PokersService ) {
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
			socket.emit( "points", { points: PointsService.getPoints() } );

			// Clean up after disconnection.
			socket.on( "disconnecting", () => {
				for ( const room in socket.rooms ) {
					if ( ! socket.rooms[ room ] ) {
						continue;
					}
					if ( ! room.includes( "/pokers#" ) ) {
						this.pokersService.disconnect( socket, room );
					}

					this.sendMembers( room );
					this.sendVotes( room );
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
		this.pokersService.greet( client, message.id );
		client.emit( "welcome" );
	}

	@SubscribeMessage( "exit" )
	exit( client: Socket ): void {
		const sockets = this.pokersService.getClientSockets( client );

		this.pokersService.exit( client );

		sockets.forEach( ( socketId: string ) => {
			// eslint-disable-next-line no-unused-expressions
			this.server.sockets[ socketId ] && this.server.sockets[ socketId ].emit( "reconnect" );
		} );
	}

	@SubscribeMessage( "join" )
	join( client: Socket, message: { poker: string; name?: string } ): void {
		this.pokersService.join( client, message.poker, message.name );

		const voteObject: Vote | null = this.pokersService.getVote(
			client,
			message.poker,
		);

		let vote: VoteResponse | null = null;
		if ( voteObject ) {
			vote = this.formatVoteResponse( voteObject );
		}
		client.emit( "joined", { poker: message.poker, vote } );

		this.sendMembers( message.poker );
		this.sendVotes( message.poker );
		this.sendHistory( message.poker );
		this.sendCurrentStory( message.poker );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { poker: string } ): void {
		const sockets = this.pokersService.getClientSockets( client );

		this.pokersService.leave( client, message.poker );

		sockets.forEach( ( socketId: string ) => {
			// eslint-disable-next-line no-unused-expressions
			this.server.sockets[ socketId ] && this.server.sockets[ socketId ].emit( "reconnect" );
		} );

		this.sendMembers( message.poker );
		this.sendVotes( message.poker );
		this.sendCurrentStory( message.poker );
	}

	@SubscribeMessage( "vote" )
	vote( client: Socket, message: { poker: string; vote } ): void {
		this.pokersService.vote( client, message.poker, message.vote );

		this.sendVotes( message.poker );
		this.sendCurrentStory( message.poker );
	}

	@SubscribeMessage( "finish" )
	finish( client: Socket, message: { poker: string } ): void {
		this.server.to( message.poker ).emit( "finished" );
	}

	@SubscribeMessage( "nickname" )
	setNickname( client: Socket, message: { name: string; poker: string } ): void {
		this.pokersService.setName( message.poker, client, message.name );

		this.sendMembers( message.poker );
		this.sendVotes( message.poker );
	}

	@SubscribeMessage( "newStory" )
	newStory( client: Socket, message: { poker: string } ): void {
		this.pokersService.newStory( message.poker );

		this.sendVotes( message.poker );
		this.sendCurrentStory( message.poker );
		this.sendHistory( message.poker );
	}

	@SubscribeMessage( "changeStoryName" )
	story( client: Socket, message: { poker: string; name: string } ): void {
		this.pokersService.setStoryName( message.poker, message.name );

		this.sendCurrentStory( message.poker );
	}

	@SubscribeMessage( "popHistory" )
	popHistory( client: Socket, message: { poker: string } ): void {
		this.pokersService.popHistory( message.poker );

		this.sendHistory( message.poker );
	}

	@SubscribeMessage( "resetHistory" )
	resetHistory( client: Socket, message: { poker: string } ): void {
		this.pokersService.resetHistory( message.poker );

		this.sendHistory( message.poker );
	}

	@SubscribeMessage( "observe" )
	observer( client: Socket, message: { poker: string } ): void {
		this.pokersService.observe( client, message.poker );

		this.sendMembers( message.poker );
		this.sendVotes( message.poker );
		this.sendCurrentStory( message.poker );
	}

	@SubscribeMessage( "toggleRevealVotes" )
	toggleRevealVotes( client: Socket, message: { poker: string } ): void {
		this.pokersService.toggleRevealVotes( message.poker );
		this.sendCurrentStory( message.poker );
		this.sendVotes( message.poker );
	}

	@SubscribeMessage( "debug" )
	getDebug( client: Socket, message: { secret: string } ): any {
		if (
			process.env.DEBUG_SECRET &&
			message.secret === process.env.DEBUG_SECRET
		) {
			client.emit( "debug", var_export( this.pokersService.debug(), true ) );
		}
	}
	/* eslint-enable require-jsdoc */

	/**
	 * Sends all votes to a room.
	 *
	 * @param {string} poker Room to send the votes for.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private sendVotes( poker: string ): void {
		const { voteCount, votes, groupedVoterNames } = this.pokersService.getVotes(
			poker,
		);

		this.server.to( poker ).emit( "votes", {
			votes: this.formatVoteResponseList( votes ),
			voteCount: voteCount,
			groupedVoterNames: groupedVoterNames,
			votedNames: this.pokersService.getVotedNames( poker ),
		} );
	}

	/**
	 * Sends an actual members count to a room.
	 *
	 * @param {string} room The room.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private sendMembers( room: string ): void {
		const clients: MemberList = this.pokersService.getClients( room );
		this.server
			.to( room )
			.emit( "memberList", this.formatMembersResponse( clients ) );
	}

	/**
	 * Sends the story-history to all clients in a room.
	 *
	 * @param {string} room The room.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private sendHistory( room: string ): void {
		const stories = this.pokersService.getHistory( room );
		this.server.to( room ).emit( "history", {
			stories: this.formatStoryResponseList( stories ),
		} );
	}

	/**
	 * Sends the story name to all room members.
	 *
	 * @param {string} room The room.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private sendCurrentStory( room: string ): void {
		this.server.to( room ).emit( "storyUpdated", {
			currentStory: this.formatStoryResponse(
				this.pokersService.getCurrentStory( room ),
			),
		} );
	}

	/**
	 * Formats the votes for the response.
	 *
	 * @param {Vote[]} votes The votes to format.
	 *
	 * @returns {VoteResponse[]} Formatted votes.
	 */
	private formatVoteResponseList( votes: Vote[] ): VoteResponse[] {
		return votes.map( this.formatVoteResponse );
	}

	/**
	 * Formats a vote for the response.
	 *
	 * @param {Vote} vote The vote.
	 *
	 * @returns {VoteResponse} The formatted vote.
	 */
	private formatVoteResponse( vote: Vote ): VoteResponse {
		return {
			currentValue: vote.currentValue,
			initialValue: vote.initialValue,
			voterName: vote.voter.name,
		};
	}

	/**
	 * Formats stories for response.
	 *
	 * @param {Story[]} stories The stories to format.
	 *
	 * @returns {StoryResponse[]} The formatted list.
	 */
	private formatStoryResponseList( stories: Story[] ): StoryResponse[] {
		return stories.map( this.formatStoryResponse.bind( this ) );
	}

	/**
	 * Formats a story for response.
	 *
	 * @param {Story} story The story to format.
	 *
	 * @returns {StoryResponse} The formatted story.
	 */
	private formatStoryResponse( story: Story ): StoryResponse {
		return {
			name: story.name,
			voteAverage: story.voteAverage,
			nearestPointAverage: story.nearestPointAverage,
			votes: this.formatVoteResponseList( story.votes ),
			votesRevealed: story.votesRevealed,
		};
	}

	/**
	 * Formats a memberlist for response.
	 *
	 * @param {MemberList} memberList The memberlist.
	 *
	 * @returns {MembersResponse} The formatted list.
	 */
	private formatMembersResponse( memberList: MemberList ): MembersResponse {
		const mapCallback = this.formatClientResponse;

		return {
			voters: Object.values( memberList.voters ).map( mapCallback ),
			observers: Object.values( memberList.observers ).map( mapCallback ),
			disconnected: Object.values( memberList.disconnected ).map( mapCallback ),
		};
	}

	/**
	 * Formats a client for response.
	 *
	 * @param {Client} client The client to format.
	 *
	 * @returns {ClientResponse} The formatted client.
	 */
	private formatClientResponse( client: Client ): ClientResponse {
		return {
			id: client.id,
			name: client.name,
		};
	}
}
