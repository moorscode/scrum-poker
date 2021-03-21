import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import PointsService from "./PointsService";
import { Member } from "./PokerMembersService";
import PokerRoomService from "./PokerRoomService";
import { Vote, Story } from "./PokerStoryService";
import SocketUsersService from "./SocketUsersService";

export interface GroupVoteNames {
	[ group: string ]: string[];
}

export interface Rooms {
	[ room: string ]: PokerRoomService;
}

export interface MemberGroups {
	voters: Member[];
	observers: Member[];
	disconnected: Member[];
}

export interface CurrentVotes {
	voteCount: number;
	votes: Vote[];
	groupedVoterNames: GroupVoteNames;
}

@Injectable()
/**
 * The Pokers service.
 */
export default class PokersService {
	private rooms: Rooms = {};

	/**
	 * Constructs the poker service.
	 *
	 * @param {SocketUsersService} socketUsersService The user socket service.
	 */
	public constructor(
		private readonly socketUsersService: SocketUsersService,
	) {}

	/**
	 * Greets a new user.
	 *
	 * @param {Socket} socket The client socket.
	 * @param {string} userId The user Id.
	 *
	 * @returns {void}
	 */
	public identify( socket: Socket, userId: string ): void {
		this.socketUsersService.add( socket, userId );
	}

	/**
	 * Remove timed out members.
	 *
	 * @returns {string[]} List of rooms that users were removed from.
	 */
	public cleanupMembers(): string[] {
		const changedRooms = [];

		for ( const room of Object.keys( this.rooms ) ) {
			if ( this.rooms[ room ].cleanupMembers() ) {
				changedRooms.push(room);
			}
		}

		return changedRooms;
	}

	/**
	 * Get the vote of a user.
	 *
	 * @param {Socket} socket The client.
	 * @param {string} room The room.
	 *
	 * @returns {Vote|null} The vote of the user.
	 */
	public getVote( socket: Socket, room: string ): Vote | null {
		return this.getRoom( room ).getCurrentVote( this.getUserId( socket ) ) || null;
	}

	/**
	 * Lets the client leave.
	 *
	 * @param {Socket} socket The client.
	 *
	 * @returns {void}
	 */
	public exit( socket: Socket ): void {
		const userId = this.getUserId( socket );

		this.socketUsersService.remove( socket );

		if ( ! this.socketUsersService.getUserIds().includes( userId ) ) {
			this.removeUserFromRooms( userId );
		}
	}

	/**
	 * Disconnects a client, stores data for reconnection.
	 *
	 * @param {Socket} socket Disconnecting client.
	 * @param {string} room The room of the user.
	 *
	 * @returns {void}
	 */
	public disconnect( socket: Socket, room: string ): void {
		this.getRoom( room ).setDisconnected( this.getUserId( socket ) );
	}

	/**
	 * Removes a user from their rooms.
	 *
	 * @param {string} userId The user Id.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private removeUserFromRooms( userId: string ): void {
		for ( const room of Object.keys( this.rooms ) ) {
			this.rooms[ room ].removeClient( userId );
			this.cleanupRoom( room );
		}
	}

	/**
	 * Retrieves a user Id for a client.
	 *
	 * @param {Socket} socket The client
	 *
	 * @returns {string} The user Id.
	 *
	 * @private
	 */
	public getUserId( socket: Socket ): string {
		return this.socketUsersService.getUserId( socket );
	}

	/**
	 * Retrieves the sockets the userId is connected with.
	 *
	 * @param {string} userId The user to get the sockets for.
	 *
	 * @returns {string[]} List of sockets with the userId.
	 */
	public getUserSockets( userId: string ): string[] {
		return this.socketUsersService.getUserSockets( userId );
	}

	/**
	 * Lets a client join a room.
	 *
	 * @param {Socket} socket The client.
	 * @param {string} poker The room.
	 * @param {string} name Client name.
	 *
	 * @returns {void}
	 */
	public join( socket: Socket, poker: string, name: string ): void {
		const useName = name || "Unnamed" + Math.floor( Math.random() * 100000 );

		socket.join( poker );

		this.rooms[ poker ] = this.getRoom( poker );
		this.rooms[ poker ].addClient( this.getUserId( socket ), useName );
	}

	/**
	 * Retrieves the room.
	 *
	 * @param {string} poker Room to get.
	 *
	 * @returns {PokerRoomService} The room.
	 *
	 * @private
	 */
	private getRoom( poker: string ): PokerRoomService {
		return this.rooms[ poker ] || new PokerRoomService();
	}

	/**
	 * Lets a client leave a room.
	 *
	 * @param {Socket} socket The client.
	 * @param {string} poker The room.
	 *
	 * @returns {void}
	 */
	public leave( socket: Socket, poker: string ): void {
		this.getRoom( poker ).removeClient( this.getUserId( socket ) );

		this.cleanupRoom( poker );

		socket.leave( poker );
	}

	/**
	 * Cleans up a room if it's empty.
	 *
	 * @param {string} room The room.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	private cleanupRoom( room: string ): void {
		if ( this.getRoom( room ).getClientCount( false ) === 0 ) {
			delete this.rooms[ room ];
		}
	}

	/**
	 * Removes the client from the room and votes lists.
	 *
	 * @param {Socket} socket The client.
	 * @param {string} poker The room.
	 *
	 * @returns {void}
	 */
	public observe( socket: Socket, poker: string ): void {
		this.getRoom( poker ).makeObserver( this.getUserId( socket ) );
	}

	/**
	 * Set a name for a client.
	 *
	 * @param {string} poker The poker.
	 * @param {Socket} socket The client.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 */
	public setName( poker: string, socket: Socket, name: string ): void {
		if ( ! name ) {
			return;
		}

		this.getRoom( poker ).setClientName( this.getUserId( socket ), name );
	}

	/**
	 * Retrieves all members.
	 *
	 * @param {string} poker The poker.
	 *
	 * @returns {MemberList} All clients in a room.
	 */
	public getMembers( poker: string ): MemberGroups {
		const room = this.getRoom( poker );
		return {
			voters: room.getVoters(),
			observers: room.getObservers(),
			disconnected: room.getDisconnected(),
		};
	}

	/**
	 * Retrieves all names of voted voters.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {string[]} List of names who voted.
	 */
	public getVotedNames( poker: string ): string[] {
		return this.getRoom( poker )
			.getVotedClients()
			.map( ( member: Member ) => member.name );
	}

	/**
	 * Registers a vote for a client in a room.
	 *
	 * @param {Socket} socket The client.
	 * @param {string} poker The room.
	 * @param {number|string} vote The vote.
	 *
	 * @returns {void}
	 */
	public castVote( socket: Socket, poker: string, vote ): void {
		// Prevent cheaters from entering bogus point totals.
		if ( ! PointsService.getPoints().includes( vote ) ) {
			return;
		}

		this.getRoom( poker ).castVote( this.getUserId( socket ), vote );
	}

	/**
	 * Retrieves the votes for a room.
	 *
	 * @param {string} poker Room.
	 *
	 * @returns {CurrentVotes} Votes in that room. Obfuscated if not all votes are in yet.
	 */
	public getVotes( poker: string ): CurrentVotes {
		const room: PokerRoomService = this.getRoom( poker );

		const voted: Member[] = room.getVotedClients();
		const votes: Vote[] = room.getCurrentVotes();

		const groupedVoterNames: GroupVoteNames = voted.reduce( ( accumulator, member: Member ) => {
			const vote: Vote            = room.getCurrentVote( member.id );
			const voteGroupKey: string  = vote.initialValue + "/" + vote.currentValue;

			accumulator[ voteGroupKey ] = accumulator[ voteGroupKey ] || [];
			accumulator[ voteGroupKey ].push( member.name );

			return accumulator;
		}, {} );

		return {
			voteCount: voted.length,
			votes,
			groupedVoterNames,
		};
	}

	/**
	 * Toggles whether or not to show votes before all votes are in for a room.
	 *
	 * @param {string} poker Room to toggle reveal.
	 *
	 * @returns {void}
	 */
	public toggleRevealVotes( poker: string ): void {
		this.getRoom( poker ).toggleRevealVotes();
	}

	/**
	 * Resets the votes for a room.
	 *
	 * @param {string} poker Room to reset.
	 *
	 * @returns {void}
	 */
	public newStory( poker: string ): void {
		this.getRoom( poker ).newStory();
	}

	/**
	 * Sets the story name.
	 *
	 * @param {string} poker Room to set to.
	 * @param {string} name Name of the story.
	 *
	 * @returns {void}
	 */
	public setStoryName( poker: string, name: string ): void {
		this.getRoom( poker ).setStoryName( name );
	}

	/**
	 * Gets the current story.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {Story} The story.
	 */
	public getStory( poker: string ): Story {
		return this.getRoom( poker ).getStory();
	}

	/**
	 * Retrieves all stories.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {Story[]} All stories.
	 */
	public getHistory( poker: string ): Story[] {
		return this.getRoom( poker ).getHistory();
	}

	/**
	 * Removes the last history item.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {void}
	 */
	public removeLastHistoryEntry( poker: string ): void {
		this.getRoom( poker ).removeLastHistoryEntry();
	}

	/**
	 * Resets room stories history.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {void}
	 */
	public resetHistory( poker: string ): void {
		this.getRoom( poker ).resetHistory();
	}
}
