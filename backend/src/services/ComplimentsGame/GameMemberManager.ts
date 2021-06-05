import EventDispatcher, { EventDispatcherInterface } from "../../base/EventDispatcher";

export type Member = {
	name: string;
	id: string;
	connected: boolean;
	disconnectTime?: number;
}

export type MemberList = {
	[ memberId: string ]: Member
}

interface MemberEventDispatcherInterface extends EventDispatcherInterface {
	/**
	 * The member added event listener.
	 *
	 * @param {string} event The event being fired: "member-added".
	 * @param {CallableFunction} callback A callback when the event is triggered, which takes a member id.
	 */
	on( event: "member-added", callback: ( id: string ) => void ): void;

	/**
	 * The member removed event listener.
	 *
	 * @param {string} event The event being fired: "member-removed".
	 * @param {CallableFunction} callback A callback when the event is triggered, which takes a member id.
	 */
	on( event: "member-removed", callback: ( id: string ) => void ): void;
}

/**
 * The poker members handler.
 */
export default class GameMemberManager extends EventDispatcher implements MemberEventDispatcherInterface {
	private readonly members: MemberList = {};

	/**
	 * Adds a member.
	 *
	 * @param {string} id The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public addMember( id: string, name: string ): void {
		this.members[ id ] = {
			id,
			name,
			connected: true,
		};

		this.dispatch( "member-added", id );
	}

	/**
	 * Adds a name to a client.
	 *
	 * @param {string} id The user Id.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public setMemberName( id: string, name: string ): void {
		this.members[ id ].name = name;
	}

	/**
	 * Removes a client from the room.
	 *
	 * @param {string} id The User ID.
	 *
	 * @returns {void}
	 *
	 * @private
	 */
	public removeMember( id: string ): void {
		delete this.members[ id ];

		this.dispatch( "member-removed", id );
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} id The user.
	 *
	 * @returns {void}
	 */
	public setDisconnected( id: string ): void {
		if ( ! this.members[ id ] ) {
			return;
		}

		this.members[ id ].disconnectTime = Date.now();
		this.members[ id ].connected      = false;

		this.dispatch( "member-removed", id );
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {MemberList[]} List of clients.
	 *
	 * @private
	 */
	public getMembers(): MemberList {
		return this.members;
	}

	/**
	 * Lists clients in a room.
	 *
	 * @param {string} memberId The ID of the member.
	 *
	 * @returns {Member} The requested member.
	 *
	 * @private
	 */
	public getMember( memberId: string ): Member {
		if ( this.members[ memberId ] ) {
			return this.members[ memberId ];
		}

		return {
			name: "Invalid",
			id: "0",
			connected: false,
		};
	}

	/**
	 * Lists disconnected members in a room.
	 *
	 * @returns {Member[]} List of disconnected members.
	 */
	public getDisconnected(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => ! member.connected );
	}

	/**
	 * Retrieves the total client count.
	 *
	 * @param {boolean} includeDisconnected Take disconnected clients into account.
	 *
	 * @returns {number} The total number of clients connected.
	 */
	public getClientCount( includeDisconnected = true ): number {
		return Object.values( this.members )
			.filter( member => member.connected || includeDisconnected ).length;
	}
}
