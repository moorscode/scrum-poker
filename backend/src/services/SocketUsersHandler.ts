import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";

type SocketUser = {
	memberId: string;
	socket: Socket;
};

type SocketUsers = {
	[ socketId: string ]: SocketUser;
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
		this.users[ socket.id ] = { memberId, socket };
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
		return Object.values( this.users ).map( ( user: SocketUser ) => user.memberId );
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
		if ( this.users[ socket.id ] ) {
			return this.users[ socket.id ].memberId;
		}

		return null;
	}

	/**
	 * Retrieves the sockets the member is connected with.
	 *
	 * @param {string} memberId The member to get the sockets for.
	 *
	 * @returns {string[]} List of socket IDs of the member.
	 */
	public getUserSockets( memberId: string ): Socket[] {
		return Object.values( this.users )
			.filter( ( user: SocketUser ) => user.memberId === memberId )
			.map( ( user: SocketUser ) => user.socket );
	}
}
