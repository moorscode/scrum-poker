import { Injectable } from "@nestjs/common";
import { Member } from "./GameMemberManager";
import GameRoomCoordinator from "./GameRoomCoordinator";
import GameService, { Rooms } from "./GameService";

@Injectable()
/**
 * The game cleanup service.
 */
export default class GameCleanupService {
	/**
	 * Constructor
	 *
	 * @param {GameService} gameService The game service.
	 */
	constructor( private readonly gameService: GameService ) {
	}

	/**
	 * Remove timed out members.
	 *
	 * @returns {string[]} List of rooms that users were removed from.
	 */
	public cleanup(): string[] {
		const rooms = this.gameService.getRooms();

		const changedRooms = this.removeTimedOutMembers( rooms );
		const removedRooms = this.removeEmptyRooms( rooms );

		return changedRooms.filter( ( room ) => ! removedRooms.includes( room ) );
	}

	/**
	 * Removes timed out users from rooms.
	 *
	 * @param {Rooms} rooms The rooms to walk through.
	 *
	 * @returns {string[]} The list of rooms that were affected.
	 */
	private removeTimedOutMembers( rooms: Rooms ): string[] {
		const changedRooms = [];

		for ( const room of Object.keys( rooms ) ) {
			const members = this.getTimedOutMembers( rooms[ room ] );
			if ( members.length > 0 ) {
				members.forEach( ( member ) => rooms[ room ].removeClient( member.id ) );

				changedRooms.push( room );
			}
		}

		return changedRooms;
	}

	/**
	 * Removes rooms that are empty.
	 *
	 * @param {Rooms} rooms Rooms to walk through.
	 *
	 * @returns {string[]} Names of the removed rooms.
	 */
	private removeEmptyRooms( rooms: Rooms ): string[] {
		const removedRooms = [];

		for ( const room of Object.keys( rooms ) ) {
			if ( rooms[ room ].getClientCount( false ) === 0 ) {
				this.gameService.removeRoom( room );

				removedRooms.push( room );
			}
		}

		return removedRooms;
	}

	/**
	 * Removes timed out members.
	 *
	 * @param {GameRoomCoordinator} room The room to check members of.
	 *
	 * @returns {Member[]} List of timed out members.
	 */
	private getTimedOutMembers( room: GameRoomCoordinator ): Member[] {
		const TIMEOUT = 30000;
		const now     = Date.now();

		// Kick after 5 minutes of inactivity.
		return room.getDisconnected().filter( ( member: Member ) => ( now - member.disconnectTime > TIMEOUT ) );
	}
}
