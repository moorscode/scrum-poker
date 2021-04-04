export type MemberType = "voter" | "observer";

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

/**
 * The poker members handler.
 */
export default class PokerMembersManager {
	private readonly members: MemberList = {};

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
		return this.getActiveMembers().length;
	}

	/**
	 * Lists the active members of the room.
	 *
	 * @returns {Member[]} List of active members.
	 */
	 public getActiveMembers(): Member[] {
		return Object.values( this.members )
			.filter( ( member: Member ) => member.type === "voter" && member.connected );
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

		this.members[ id ] = member;
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
			this.members[ id ].type = "observer";
			this.members[ id ].connected = true;
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
		}
	}
}
