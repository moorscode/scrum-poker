import { Injectable } from "@nestjs/common";
import { Member } from "../services/PokerMembersHandler";
import PokersService, { MemberGroups } from "../services/PokersService";

export interface MembersResponse {
	voters: string[];
	observers: string[];
	disconnected: string[];
}

@Injectable()
/**
 * The members response adapter.
 */
export default class MembersResponseAdapter {
	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	 constructor(
		private readonly pokersService: PokersService,
	 ) {}

	/**
	 * Formats the members in a room for response.
	 *
	 * @param {string} room The room to format the members of.
	 *
	 * @returns {MembersResponse} The formatted list.
	 */
	public format( room: string ): MembersResponse {
		const memberGroups: MemberGroups = this.pokersService.getMembers( room );

		/**
		 * Lists the names of the members.
		 *
		 * @param {Member} member The member.
		 *
		 * @returns {string} The name of the member.
		 */
		const mapCallback = ( ( member: Member ): string => member.name );

		return {
			voters: memberGroups.voters.map( mapCallback ),
			observers: memberGroups.observers.map( mapCallback ),
			disconnected: memberGroups.disconnected.map( mapCallback ),
		};
	}
}
