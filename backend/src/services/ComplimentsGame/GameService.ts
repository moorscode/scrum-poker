import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import SocketUserHandler from "../SocketUsersHandler";
import CardsProvider from "./CardsProvider";
import { Game } from "./GameHandler";
import { MemberList } from "./GameMemberManager";
import GameRoomCoordinator  from "./GameRoomCoordinator";

export type Rooms = {
	[ room: string ]: GameRoomCoordinator;
}

@Injectable()
/**
 * The Pokers service.
 */
export default class GameService {
	private rooms: Rooms = {};

	/**
	 * Constructs the poker service.
	 *
	 * @param {SocketUserHandler} socketUsersService The user socket service.
	 * @param {CardsProvider} cardsProvider The cards provider.
	 */
	public constructor(
		private readonly socketUsersService: SocketUserHandler,
		private readonly cardsProvider: CardsProvider,
	) {
	}

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
	 * The list of users of a room.
	 *
	 * @param {string} room The room to get the users from.
	 *
	 * @returns {MemberList} The list of users per connected/disconnected.
	 */
	public getMembers( room: string ): MemberList {
		return this.getRoom( room ).getMembers();
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

		const remainingRooms = remainingSockets.reduce(
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
	 * @param {string} room The room.
	 * @param {string} name Client name.
	 *
	 * @returns {void}
	 */
	public join( socket: Socket, room: string, name: string ): void {
		const useName = name || "Unnamed" + Math.floor( Math.random() * 100000 );

		socket.join( room );

		this.getRoom( room ).addClient( this.getUserId( socket ), useName );
	}

	/**
	 * Retrieves the room.
	 *
	 * @param {string} room Room to get.
	 * @param {boolean} create Create the room if it does not exist..
	 *
	 * @returns {GameRoomCoordinator} The room.
	 *
	 * @private
	 */
	private getRoom( room: string, create = true ): GameRoomCoordinator {
		// Create a room if it doesn't exist already.
		if ( ! this.rooms[ room ] ) {
			if ( ! create ) {
				return null;
			}

			this.rooms[ room ] = new GameRoomCoordinator( this.cardsProvider );
			this.rooms[ room ].newGame();
		}

		return this.rooms[ room ];
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
	 * @param {string} room Room to remove.
	 *
	 * @returns {void}
	 */
	public removeRoom( room: string ): void {
		if ( this.rooms[ room ] ) {
			delete this.rooms[ room ];
		}
	}

	/**
	 * Lets a client leave a room.
	 *
	 * @param {Socket} socket The client.
	 * @param {string} room The room.
	 *
	 * @returns {void}
	 */
	public leave( socket: Socket, room: string ): void {
		const theRoom = this.getRoom( room, false );
		if ( theRoom ) {
			theRoom.removeClient( this.getUserId( socket ) );
		}

		socket.leave( room );
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
	 * Creates a new game in a room.
	 *
	 * @param {string} room Room to start a new game in.
	 *
	 * @returns {void}
	 */
	public newGame( room: string ): void {
		this.getRoom( room ).newGame();
	}

	/**
	 * Starts a new game.
	 *
	 * @param {string} room The room to start a game in.
	 *
	 * @returns {void}
	 */
	public startGame( room: string ): void {
		this.getRoom( room ).startGame();
	}

	/**
	 * Gets the current story.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {Game} The story.
	 */
	public getGame( poker: string ): Game {
		return this.getRoom( poker ).getGame();
	}
}
