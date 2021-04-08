import { from } from "rxjs";

export type MemberType = "voter" | "observer" | "invalid";

export interface Member {
	name: string;
	id: string;
	type: MemberType;
	connected: boolean;
	disconnectTime?: number;
}

export interface MemberList {
	[ memberId: string ]: Member
}

interface EventManager {
	on(event: string, execute: CallableFunction): void;
}

interface Event {
	[ identifier: string ]: CallableFunction;
}

/**
 * The poker members handler.
 */
export default class PokerMemberManager implements EventManager {
	private readonly members: MemberList = {};
	private events: Event[] = [];

	/**
	 * Hooks a function onto an event.
	 *
	 * @param event The event to hook onto.
	 * @param execute The method that needs to be executed on the event.
	 *
	 * @returns {void}
	 */
	public on( event: string, execute: CallableFunction ): void {
		this.events[ event ] = this.events[ event ] || [];
		this.events[ event ].push( execute );
	}

	/**
	 * Triggers an event.
	 *
	 * @param {string} event The event identifier.
	 * @param {object} context Optional. Context of the event.
	 * @returns {void}
	 */
	private trigger( event: string, context?: any ): void {
		if ( ! this.events[ event ] ) {
			return;
		}

		this.events[ event ].map( ( callable: CallableFunction ) => callable( context ) );
	}

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

		let from: string = "";

		if ( this.members[ id ] ) {
			from = this.members[ id ].type;
			from = this.members[ id ].connected === false ? "disconnected" : from;
		}

		this.members[ id ] = member;
	
		this.trigger( 'member-state', { from, to: "voter" } );
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

		this.trigger( 'member-state', { from, to: "removed" } );
		this.trigger( 'member-removed', id );
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} id The user.
	 *
	 * @returns {void}
	 */
	 public makeObserver( id: string ): void {
		if ( this.members[ id ] ) {
			const from = this.members[ id ].type;

			this.members[ id ].type = "observer";
			this.members[ id ].connected = true;

			this.trigger( 'member-state', { from, to: "observer" } );
			this.trigger( 'member-removed', id );
		}
	}

	/**
	 * Sets a user as an observer.
	 *
	 * @param {string} id The user.
	 *
	 * @returns {void}
	 */
	 public setDisconnected( id: string ): void {
		if ( this.members[ id ] ) {
			this.members[ id ].disconnectTime = Date.now();
			this.members[ id ].connected = false;

			this.trigger( 'member-state', { from: this.members[ id ].type, to: "disconnected" } );
		}
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
