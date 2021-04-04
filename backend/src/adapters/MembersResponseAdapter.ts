import { Injectable } from "@nestjs/common";
import { Member } from "../services/PokerMemberManager";
import { MemberGroups } from "../services/PokersService";

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
	 * Formats the members in a room for response.
	 *
	 * @param {MemberGroups} memberGroups The members groups to format.
	 *
	 * @returns {MembersResponse} The formatted list.
	 */
	public format( memberGroups: MemberGroups ): MembersResponse {
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
