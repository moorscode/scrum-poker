import { Injectable } from "@nestjs/common";
import { Member } from "../services/PokerMemberManager";
import { GroupedMembers } from "../services/PokersService";

export type MembersResponse = {
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
	 * @param {GroupedMembers} groupedMembers The members groups to format.
	 *
	 * @returns {MembersResponse} The formatted list.
	 */
	public format( groupedMembers: GroupedMembers ): MembersResponse {
		/**
		 * Lists the names of the members.
		 *
		 * @param {Member} member The member.
		 *
		 * @returns {string} The name of the member.
		 */
		const mapCallback = ( ( member: Member ): string => member.name );

		return {
			voters: groupedMembers.voters.map( mapCallback ),
			observers: groupedMembers.observers.map( mapCallback ),
			disconnected: groupedMembers.disconnected.map( mapCallback ),
		};
	}
}
