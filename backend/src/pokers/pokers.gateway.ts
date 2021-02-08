import { OnGatewayInit, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
// eslint-disable-next-line camelcase
import { Server, Socket } from "socket.io";
import { PointsService } from "../points/points.service";
import { Member, Story, Vote, VoteValue } from "./poker-room";
import { PokersService, MemberGroups } from "./pokers.service";

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

					this.send( { poker: room, members: true, votes: true } );
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

		const voteObject: Vote | null = this.pokersService.getVote( client, message.poker );
		const vote: VoteResponse | null = ( voteObject ) ? this.formatVoteResponse( voteObject ) : null;

		client.emit( "joined", { poker: message.poker, vote } );

		this.send( { poker: message.poker, all: true } );
	}

	@SubscribeMessage( "leave" )
	leave( client: Socket, message: { poker: string } ): void {
		this.pokersService.leave( client, message.poker );

		this.send( { poker: message.poker, members: true, votes: true, story: true } );
	}

	@SubscribeMessage( "vote" )
	vote( client: Socket, message: { poker: string; vote } ): void {
		this.pokersService.vote( client, message.poker, message.vote );

		this.send( { poker: message.poker, story: true, votes: true } );
	}

	@SubscribeMessage( "finish" )
	finish( client: Socket, message: { poker: string } ): void {
		this.server.to( message.poker ).emit( "finished" );
	}

	@SubscribeMessage( "nickname" )
	setNickname( client: Socket, message: { name: string; poker: string } ): void {
		this.pokersService.setName( message.poker, client, message.name );

		this.send( { poker: message.poker, members: true, votes: true } );
	}

	@SubscribeMessage( "newStory" )
	newStory( client: Socket, message: { poker: string } ): void {
		this.pokersService.newStory( message.poker );

		this.send( { poker: message.poker, story: true, votes: true, history: true } );
	}

	@SubscribeMessage( "changeStoryName" )
	story( client: Socket, message: { poker: string; name: string } ): void {
		this.pokersService.setStoryName( message.poker, message.name );

		this.send( { poker: message.poker, story: true } );
	}

	@SubscribeMessage( "popHistory" )
	popHistory( client: Socket, message: { poker: string } ): void {
		this.pokersService.popHistory( message.poker );

		this.send( { poker: message.poker, history: true } );
	}

	@SubscribeMessage( "resetHistory" )
	resetHistory( client: Socket, message: { poker: string } ): void {
		this.pokersService.resetHistory( message.poker );

		this.send( { poker: message.poker, history: true } );
	}

	@SubscribeMessage( "observe" )
	observer( client: Socket, message: { poker: string } ): void {
		this.pokersService.observe( client, message.poker );

		this.send( { poker: message.poker, story: true, votes: true, members: true } );
	}

	@SubscribeMessage( "toggleRevealVotes" )
	toggleRevealVotes( client: Socket, message: { poker: string } ): void {
		this.pokersService.toggleRevealVotes( message.poker );

		this.send( { poker: message.poker, story: true, votes: true } );
	}
	/* eslint-enable require-jsdoc */

	/**
	 * Sends data to all members in the room.
	 *
	 * @param {object} param0 Which data to send.
	 *
	 * @returns {void}
	 */
	private send( {
		poker = "",
		story = false,
		votes = false,
		members = false,
		history = false,
		all = false,
	} = {} ) {
		if ( all || story || votes ) {
			this.sendCurrentStory( poker );
		}

		if ( all || votes ) {
			this.sendVotes( poker );
		}

		if ( all || members ) {
			this.sendMembers( poker );
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
		const memberGroups: MemberGroups = this.pokersService.getMembers( room );
		this.server.to( room ).emit( "memberList", this.formatMembersResponse( memberGroups ) );
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
		this.server.to( room ).emit( "history", { stories: this.formatStoryResponseList( stories ) } );
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
		this.server.to( room ).emit(
			"storyUpdated",
			{
				currentStory: this.formatStoryResponse( this.pokersService.getCurrentStory( room ) ),
			},
		);
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
	 * @param {Member} client The client to format.
	 *
	 * @returns {ClientResponse} The formatted client.
	 */
	private formatClientResponse( client: Member ): ClientResponse {
		return {
			id: client.id,
			name: client.name,
		};
	}
}
