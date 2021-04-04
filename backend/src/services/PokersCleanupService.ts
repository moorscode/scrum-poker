import { Injectable } from "@nestjs/common";
import { Member } from "./PokerMembersManager";
import PokerRoomCoordinator from "./PokerRoomCoordinator";
import PokersService, { Rooms } from "./PokersService";

@Injectable()
/**
 * The Pokers cleanup service.
 */
export default class PokersCleanupService {
	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	constructor( private readonly pokersService: PokersService ) {}

	/**
	 * Remove timed out members.
	 *
	 * @returns {string[]} List of rooms that users were removed from.
	 */
	public cleanup(): string[] {
		const rooms = this.pokersService.getRooms();

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

				rooms[ room ].recalculateStory();

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
				this.pokersService.removeRoom( room );

				removedRooms.push( room );
			}
		}

		return removedRooms;
	}

	/**
	 * Removes timed out members.
	 *
	 * @param {PokerRoomCoordinator} room The room to check members of.
	 *
	 * @returns {Member[]} List of timed out members.
	 */
	private getTimedOutMembers( room: PokerRoomCoordinator ): Member[] {
		const TIMEOUT = 30000;
		const now     = Date.now();

		// Kick after 5 minutes of inactivity.
		return room.getDisconnected().filter( ( member: Member ) => ( now - member.disconnectTime > TIMEOUT ) );
	}
}
