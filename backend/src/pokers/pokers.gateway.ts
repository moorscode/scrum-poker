import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PointsService } from "../points/points.service";
import { Member, Story, Vote, VoteValue } from "./poker-room";
import { PokersService, MemberGroups, GroupVoteName } from "./pokers.service";

interface VoteResponse {
	voterName: string;
	currentValue: VoteValue;
	initialValue: VoteValue;
}

interface VotesResponse {
	votes: VoteResponse[];
	voteCount: number;
	groupedVoterNames: GroupVoteName[];
	votedNames: string[];
	voteAverage?: number | string;
	nearestPointAverage?: VoteValue;
	votesRevealed: boolean;
}

interface StoryHistoryResponse {
	name: string;
	votes: VoteResponse[];
	voteAverage?: number | string;
}

interface MembersResponse {
	voters: string[];
	observers: string[];
	disconnected: string[];
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
			socket.emit( "points", PointsService.getPoints() );

			// Clean up after disconnection.
			socket.on( "disconnecting", () => {
				for ( const room in socket.rooms ) {
					if ( ! socket.rooms[ room ] ) {
						continue;
					}
					if ( ! room.includes( "/pokers#" ) ) {
						this.pokersService.disconnect( socket, room );
					}

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

		const story = this.pokersService.getCurrentStory( message.poker );
		client.emit( "story", story.name );

		const vote = this.pokersService.getVote( client, message.poker );
		if ( vote ) {
			client.emit( "myVote", { currentVote: vote.currentValue, initialVote: vote.initialValue } );
		}

		this.send( message.poker, { members: true, votes: true } );
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
			this.server.sockets[ socketId ].emit( "myVote", { currentVote: vote.currentValue, initialVote: vote.initialValue } );
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
		this.pokersService.popHistory( message.poker );

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
			this.sendCurrentStory( poker );
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
	}

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
		const { voteCount, votes, groupedVoterNames } = this.pokersService.getVotes( poker );
		const story: Story = this.pokersService.getCurrentStory( poker );

		const data: VotesResponse = {
			votes: this.formatVoteResponseList( votes ),
			voteCount,
			groupedVoterNames,
			votedNames: this.pokersService.getVotedNames( poker ),
			voteAverage: story.voteAverage,
			nearestPointAverage: story.nearestPointAverage,
			votesRevealed: story.votesRevealed,
		};

		this.server.to( poker ).emit( "votes", data );
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
		const data = this.formatMembersResponse( this.pokersService.getMembers( room ) );
		this.server.to( room ).emit( "memberList", data );
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
		const data = { stories: this.formatStoryHistoryResponseList( this.pokersService.getHistory( room ) ) };
		this.server.to( room ).emit( "history", data );
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
		const story = this.pokersService.getCurrentStory( room );
		this.server.to( room ).emit( "story", story.name );
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
	 * @returns {StoryHistoryResponse[]} The formatted list.
	 */
	private formatStoryHistoryResponseList( stories: Story[] ): StoryHistoryResponse[] {
		return stories.map( this.formatStoryHistoryResponse.bind( this ) );
	}

	/**
	 * Formats a story for response.
	 *
	 * @param {Story} story The story to format.
	 *
	 * @returns {StoryHistoryResponse} The formatted story.
	 */
	private formatStoryHistoryResponse( story: Story ): StoryHistoryResponse {
		return {
			name: story.name,
			votes: this.formatVoteResponseList( story.votes ),
			voteAverage: story.voteAverage,
		};
	}

	/**
	 * Formats the members in a room for response.
	 *
	 * @param {MemberGroups} memberGroups The members in their groups.
	 *
	 * @returns {MembersResponse} The formatted list.
	 */
	private formatMembersResponse( memberGroups: MemberGroups ): MembersResponse {
		const mapCallback = this.formatClientResponse;

		return {
			voters: memberGroups.voters.map( mapCallback ),
			observers: memberGroups.observers.map( mapCallback ),
			disconnected: memberGroups.disconnected.map( mapCallback ),
		};
	}

	/**
	 * Formats a client for response.
	 *
	 * @param {Member} member The client to format.
	 *
	 * @returns {ClientResponse} The formatted client.
	 */
	private formatClientResponse( member: Member ): string {
		return member.name;
	}
}
