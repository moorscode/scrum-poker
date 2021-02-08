import { Injectable } from "@nestjs/common";
import { Socket } from "socket.io";
import { PointsService } from "../points/points.service";
import { Member, MemberList, PokerRoom, Story, Vote } from "./poker-room";

interface CurrentVotes {
	voteCount: number;
	votes: Vote[];
	voters: number;
	groupedVoterNames: { [ vote: string ]: string[] };
}

export interface Rooms {
	[ room: string ]: PokerRoom;
}

export interface Users {
	[ socketId: string ]: string;
}

export interface MemberGroups {
	voters: Member[];
	observers: Member[];
	disconnected: Member[];
}

@Injectable()
/**
 * The Pokers service.
 */
export class PokersService {
	private rooms: Rooms = {};
	private users: Users = {};

	/**
	 * Greets a new user.
	 *
	 * @param {Socket} client The client socket.
	 * @param {string} userId The user Id.
	 *
	 * @returns {void}
	 */
	public identify( client: Socket, userId: string ): void {
		this.users[ client.id ] = userId;
	}

	/**
	 * Get the vote of a user.
	 *
	 * @param {Socket} client The client.
	 * @param {string} room The room.
	 *
	 * @returns {Vote|null} The vote of the user.
	 */
	public getVote( client: Socket, room: string ): Vote | null {
		return this.getRoom( room ).getCurrentVote( this.getUserId( client ) ) || null;
	}

	/**
	 * Lets the client leave.
	 *
	 * @param {Socket} client The client.
	 *
	 * @returns {void}
	 */
	public exit( client: Socket ): void {
		const userId = this.getUserId( client );

		this.removeUserFromRooms( userId );

		for ( const socketId of Object.keys( this.users ) ) {
			if ( this.users[ socketId ] === userId ) {
				delete this.users[ socketId ];
			}
		}
	}

	/**
	 * Disconnects a client, stores data for reconnection.
	 *
	 * @param {Socket} client Disconnecting client.
	 * @param {string} room The room of the user.
	 *
	 * @returns {void}
	 */
	public disconnect( client: Socket, room: string ): void {
		this.getRoom( room ).setDisconnected( this.getUserId( client ) );
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
	 * Retrieves all sockets a client has connected with.
	 *
	 * @param {Socket} client The client.
	 *
	 * @returns {string[]} List of socket Ids.
	 */
	public getClientSockets( client: Socket ): string[] {
		const sockets = [];
		const userId  = this.getUserId( client );

		if ( ! userId ) {
			return sockets;
		}

		for ( const clientId in this.users ) {
			if ( client.id === clientId ) {
				continue;
			}
			if (
				Object.prototype.hasOwnProperty.call( this.users, clientId ) &&
				this.users[ clientId ] === userId
			) {
				sockets.push( clientId );
			}
		}
		return sockets;
	}

	/**
	 * Retrieves a user Id for a client.
	 *
	 * @param {Socket} client The client
	 *
	 * @returns {string} The user Id.
	 *
	 * @private
	 */
	public getUserId( client: Socket ): string {
		return this.users[ client.id ];
	}

	/**
	 * Lets a client join a room.
	 *
	 * @param {Socket} client The client.
	 * @param {string} poker The room.
	 * @param {string} name Client name.
	 *
	 * @returns {void}
	 */
	public join( client: Socket, poker: string, name: string ): void {
		const useName = name || "Unnamed" + Math.floor( Math.random() * 100000 );

		client.join( poker );

		this.rooms[ poker ] = this.getRoom( poker );
		this.rooms[ poker ].addClient( this.getUserId( client ), useName );
	}

	/**
	 * Retrieves the room.
	 *
	 * @param {string} poker Room to get.
	 *
	 * @returns {PokerRoom} The room.
	 *
	 * @private
	 */
	private getRoom( poker: string ): PokerRoom {
		return this.rooms[ poker ] || new PokerRoom();
	}

	/**
	 * Lets a client leave a room.
	 *
	 * @param {Socket} client The client.
	 * @param {string} poker The room.
	 *
	 * @returns {void}
	 */
	public leave( client: Socket, poker: string ): void {
		this.getRoom( poker ).removeClient( this.getUserId( client ) );

		this.cleanupRoom( poker );

		client.leave( poker );
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
	 * @param {Socket} client The client.
	 * @param {string} poker The room.
	 *
	 * @returns {void}
	 */
	public observe( client: Socket, poker: string ): void {
		this.getRoom( poker ).makeObserver( this.getUserId( client ) );
	}

	/**
	 * Set a name for a client.
	 *
	 * @param {string} poker The poker.
	 * @param {Socket} client The client.
	 * @param {string} name The name.
	 *
	 * @returns {void}
	 */
	public setName( poker: string, client: Socket, name: string ): void {
		if ( ! name ) {
			return;
		}

		this.getRoom( poker ).setClientName( this.getUserId( client ), name );
	}

	/**
	 * Retrieves all clients.
	 *
	 * @param {string} poker The poker.
	 *
	 * @returns {MemberList} All clients in a room.
	 */
	public getClients( poker: string ): MemberList {
		return this.getRoom( poker ).getClients();
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
	 * Retrieves the number of members that can vote in a room.
	 *
	 * @param {string} poker The room.
	 *
	 * @returns {number} Number of members that can vote in the room.
	 */
	public getVoterCount( poker: string ): number {
		return this.getRoom( poker ).getVoterCount();
	}

	/**
	 * Registers a vote for a client in a room.
	 *
	 * @param {Socket} client The client.
	 * @param {string} poker The room.
	 * @param {number|string} vote The vote.
	 *
	 * @returns {void}
	 */
	public castVote( client: Socket, poker: string, vote ): void {
		// Prevent cheaters from entering bogus point totals.
		if ( ! PointsService.getPoints().includes( vote ) ) {
			return;
		}

		this.getRoom( poker ).castVote( this.getUserId( client ), vote );
	}

	/**
	 * Retrieves the votes for a room.
	 *
	 * @param {string} poker Room.
	 *
	 * @returns {CurrentVotes} Votes in that room. Obfuscated if not all votes are in yet.
	 */
	public getVotes( poker: string ): CurrentVotes {
		const room: PokerRoom = this.getRoom( poker );
		const voted: Member[] = room.getVotedClients();
		const votes           = room.getCurrentVotes();
		const voters: number  = room.getVoterCount();

		return {
			voteCount: voted.length,
			votes,
			voters,
			groupedVoterNames: voted.reduce( ( accumulator, member: Member ) => {
				const vote                  = room.getCurrentVote( member.id );
				const voteGroupKey: string  = vote.initialValue + "/" + vote.currentValue;
				accumulator[ voteGroupKey ] = accumulator[ voteGroupKey ] || [];
				accumulator[ voteGroupKey ].push( member.name );
				return accumulator;
			}, {} ),
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
	public getCurrentStory( poker: string ): Story {
		return this.getRoom( poker ).getCurrentStory();
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
	public popHistory( poker: string ): void {
		this.getRoom( poker ).popHistory();
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
