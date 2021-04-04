import { Injectable } from "@nestjs/common";
import { Story, Vote, VoteValue } from "../services/PokerStoryHandler";
import { CurrentVotes, GroupVoteNames } from "../services/PokersService";

export interface VoteResponse {
	voterName: string;
	currentValue: VoteValue;
	initialValue: VoteValue;
}

export interface VotesResponse {
	votes: VoteResponse[];
	voteCount: number;
	groupedVoterNames: GroupVoteNames;
	votedNames: string[];
	voteAverage?: number | string;
	nearestPointAverage?: VoteValue;
	votesRevealed: boolean;
}

@Injectable()
/**
 * The vote reponse adapter.
 */
export default class VoteResponseAdapter {
	/**
	 * Formats the votes response.
	 *
	 * @param {CurrentVotes} curentVotes The votes to format.
	 * @param {string[]} votedNames The names of the voters.
	 * @param { Story} story The story.
	 *
	 * @returns {VotesResponse} The response.
	 */
	public format( curentVotes: CurrentVotes, votedNames: string[], story: Story ): VotesResponse {
		const { voteCount, votes, groupedVoterNames } = curentVotes;

		return {
			votes: this.formatVoteList( votes ),
			voteCount,
			groupedVoterNames,
			votedNames,
			voteAverage: story.voteAverage,
			nearestPointAverage: story.nearestPointAverage,
			votesRevealed: story.votesRevealed,
		};
	}

	/**
	 * Formats the votes for the response.
	 *
	 * @param {Vote[]} votes The votes to format.
	 *
	 * @returns {VoteResponse[]} Formatted votes.
	 */
	public formatVoteList( votes: Vote[] ): VoteResponse[] {
		return votes.map( ( vote: Vote ): VoteResponse => {
			return {
				currentValue: vote.currentValue,
				initialValue: vote.initialValue,
				voterName: vote.voter.name,
			};
		} );
	}
}
