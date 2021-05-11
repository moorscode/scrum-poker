import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import PointsProvider from "./PointsProvider";
import { Member } from "./PokerMemberManager";
import PokerRoomCoordinator from "./PokerRoomCoordinator";
import { Vote, Story } from "./PokerStoryHandler";
import SocketUserHandler from "./SocketUsersHandler";

export type GroupVoteNames = {
	[ group: string ]: string[];
}

export type Rooms = {
	[ room: string ]: PokerRoomCoordinator;
}

export type GroupedMembers = {
	voters: Member[];
	observers: Member[];
	disconnected: Member[];
}

export type CurrentVotes = {
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
	 * @param {SocketUserHandler} socketUsersService The user socket service.
	 * @param {PointsProvider} pointsProvider The points provider.
	 */
	public constructor(
		private readonly socketUsersService: SocketUserHandler,
		private readonly pointsProvider: PointsProvider,
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
	 * @returns {string[]} Affected rooms.
	 */
	public exit( socket: Socket ): string[] {
		const removeFromRooms = this.getRoomsToRemoveFrom( socket );
		removeFromRooms.map( ( room: string ) => this.leave( socket, room ) );

		this.socketUsersService.remove( socket );

		return removeFromRooms;
	}

	/**
	 * Disconnects a client, stores data for reconnection.
	 *
	 * @param {Socket} socket Disconnecting client.
	 *
	 * @returns {string[]} List of affected rooms.
	 */
	public disconnect( socket: Socket ): string[] {
		const memberId = this.socketUsersService.getMemberId( socket );
		if ( ! memberId ) {
			return [];
		}

		const removeFromRooms = this.getRoomsToRemoveFrom( socket );
		removeFromRooms.map( ( poker: string ) => {
			const room = this.getRoom( poker, false );
			if ( room ) {
				room.setDisconnected( memberId );
			}
		} );

		this.socketUsersService.remove( socket );

		return removeFromRooms;
	}

	/**
	 * List of rooms the provided socket was in alone.
	 *
	 * @param {Socket} socket The socket to base this on.
	 *
	 * @returns {string[]} List of room names.
	 */
	private getRoomsToRemoveFrom( socket: Socket ): string[] {
		const memberId = this.socketUsersService.getMemberId( socket );
		if ( ! memberId ) {
			return [];
		}

		const socketRooms = Object.keys( socket.rooms ).filter( ( room: string ) => room !== socket.id );

		const userSockets      = this.socketUsersService.getUserSockets( memberId );
		const remainingSockets = userSockets.filter( ( userSocket: Socket ) => userSocket.id !== socket.id );

		if ( remainingSockets.length === 0 ) {
			return socketRooms;
		}

		const remainingRooms   = remainingSockets.reduce(
			( accumulator, otherSocket: Socket ) => {
				return accumulator
					.concat(
						Object.keys( otherSocket.rooms ).filter( ( room: string ) => room !== otherSocket.id ),
					);
			},
			[],
		);

		// Remove from all rooms that do not match other sockets rooms.
		return socketRooms.filter( ( room: string ) => ! remainingRooms.includes( room ) );
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
		return this.socketUsersService.getMemberId( socket );
	}

	/**
	 * Retrieves the sockets the userId is connected with.
	 *
	 * @param {string} userId The user to get the sockets for.
	 *
	 * @returns {Socket[]} List of sockets with the userId.
	 */
	public getUserSockets( userId: string ): Socket[] {
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

		this.getRoom( poker ).addClient( this.getUserId( socket ), useName );
	}

	/**
	 * Retrieves the room.
	 *
	 * @param {string} poker Room to get.
	 * @param {boolean} create Create the room if it does not exist..
	 *
	 * @returns {PokerRoomCoordinator} The room.
	 *
	 * @private
	 */
	private getRoom( poker: string, create = true ): PokerRoomCoordinator {
		// Create a room if it doesn't exist already.
		if ( ! this.rooms[ poker ] ) {
			if ( ! create ) {
				return null;
			}

			this.rooms[ poker ] = new PokerRoomCoordinator( this.pointsProvider );
		}

		return this.rooms[ poker ];
	}

	/**
	 * Provides all the rooms.
	 *
	 * @returns {Rooms} All the rooms.
	 */
	public getRooms(): Rooms {
		return this.rooms;
	}

	/**
	 * Removes a room.
	 *
	 * @param {string} poker Room to remove.
	 *
	 * @returns {void}
	 */
	public removeRoom( poker: string ): void {
		if ( this.rooms[ poker ] ) {
			delete this.rooms[ poker ];
		}
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
		const room = this.getRoom( poker, false );
		if ( room ) {
			room.removeClient( this.getUserId( socket ) );
		}

		socket.leave( poker );
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
	public getGroupedMembers( poker: string ): GroupedMembers {
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
		if ( ! this.pointsProvider.getPoints().includes( vote ) ) {
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
		return this.getRoom( poker ).getVotes();
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
