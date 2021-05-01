import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

type SocketUsers = {
	[ socketId: string ]: string;
}

@Injectable()
/**
 * Socket Users Handler
 */
export default class SocketUserHandler {
	private users: SocketUsers = {};

	/**
	 * Greets a new user socket connection.
	 *
	 * @param {Socket} socket The client socket.
	 * @param {string} memberId The user Id.
	 *
	 * @returns {void}
	 */
	public add( socket: Socket, memberId: string ): void {
		this.users[ socket.id ] = memberId;
	}

	/**
	 * Removes a socket connection.
	 *
	 * @param {string} socketId The socket that needs to be removed.
	 *
	 * @returns {void}
	 */
	public remove( socketId: string ): void {
		delete this.users[ socketId ];
	}

	/**
	 * Retrieves a list of all user IDs.
	 *
	 * @returns {string[]} List of all user IDs.
	 */
	public getMemberIds(): string[] {
		return Object.values( this.users );
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
	public getMemberId( socket: Socket ): string {
		return this.users[ socket.id ];
	}

	/**
	 * Retrieves the sockets the member is connected with.
	 *
	 * @param {string} memberId The member to get the sockets for.
	 *
	 * @returns {string[]} List of socket IDs of the member.
	 */
	public getUserSockets( memberId: string ): string[] {
		const socketIds = [];

		for ( const socketId of Object.keys( this.users ) ) {
			if ( this.users[ socketId ] === memberId ) {
				socketIds.push( socketId );
			}
		}

		return socketIds;
	}
}
