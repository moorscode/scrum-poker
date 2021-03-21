import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

interface SocketUsers {
	[ socketId: string ]: string;
}

@Injectable()
export default class SocketUsersService {
	private socketUsers: SocketUsers = {};

	/**
	 * Greets a new user socket connection.
	 *
	 * @param {Socket} socket The client socket.
	 * @param {string} userId The user Id.
	 *
	 * @returns {void}
	 */
	public add( socket: Socket, userId: string ): void {
		this.socketUsers[ socket.id ] = userId;
	}

	/**
	 * Removes a socket connection.
	 *
	 * @param {Socket} socket The socket that needs to be removed.
	 */
	public remove( socket: Socket ): void {
		delete this.socketUsers[ socket.id ];
	}

	public getUserIds(): string[] {
		return Object.values( this.socketUsers );
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
		return this.socketUsers[ socket.id ];
	}

	/**
	 * Retrieves the sockets the userId is connected with.
	 *
	 * @param {string} userId The user to get the sockets for.
	 *
	 * @returns {string[]} List of sockets with the userId.
	 */
	public getUserSockets( userId: string ): string[] {
		const socketIds = [];

		for ( const socketId of Object.keys( this.socketUsers ) ) {
			if ( this.socketUsers[ socketId ] === userId ) {
				socketIds.push( socketId );
			}
		}

		return socketIds;
	}
}
