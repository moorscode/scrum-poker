import EventDispatcher, { EventDispatcherInterface } from "../base/EventDispatcher";

export type MemberType = "voter" | "observer" | "invalid";

export type Member = {
	name: string;
	id: string;
	type: MemberType;
	connected: boolean;
	disconnectTime?: number;
}

export type MemberList = {
	[ memberId: string ]: Member
}

export type MemberState = {
	from: string;
	to: string;
	id: string;
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

	/**
	 * The member state changed event listener.
	 *
	 * @param {string} event The event being fired: "member-state".
	 * @param {CallableFunction} callback A callback when the event is triggered, which receives a member-state.
	 */
	on( event: "member-state", callback: ( state: MemberState ) => void ): void;
}

/**
 * The poker members handler.
 */
export default class PokerMemberManager extends EventDispatcher implements MemberEventDispatcherInterface {
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
		const member: Member = {
			id,
			name,
			type: "voter",
			connected: true,
		};

		let from = "";

		if ( this.members[ id ] ) {
			from = this.members[ id ].type;
			from = this.members[ id ].connected === false ? "disconnected" : from;
		}

		this.members[ id ] = member;

		this.dispatch( "member-added", id );
		this.dispatch( "member-state", { from, to: "voter", id } );
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
	public makeObserver( id: string ): void {
		if ( ! this.members[ id ] ) {
			return;
		}

		const from = this.members[ id ].type;

		this.members[ id ].type      = "observer";
		this.members[ id ].connected = true;

		this.dispatch( "member-state", { from, to: "observer", id } );
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

		this.dispatch( "member-state", { from: this.members[ id ].type, to: "disconnected", id } );
	}

	/**
	 * Lists clients in a room.
	 *
	 * @returns {Member[]} List of observers.
	 */
	public getObservers(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => member.type === "observer" && member.connected );
	}

	/**
	 * Lists voters in a room.
	 *
	 * @returns {Member[]} List of voters.
	 */
	public getVoters(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => member.type === "voter" && member.connected );
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
			type: "invalid",
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
	 * Lists all poker voters.
	 *
	 * @returns {number} Number of voters.
	 */
	public getVoterCount(): number {
		return this.getVoters().length;
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
