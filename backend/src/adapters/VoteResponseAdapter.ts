import { Injectable } from "@nestjs/common";
import { Story, Vote, VoteValue } from "../services/PokerStoryService";
import PokersService, { GroupVoteNames } from "../services/PokersService";

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
export default class VoteResponseAdapter {
	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	constructor( private readonly pokersService: PokersService ) {}

	/**
	 * Formats the votes response.
	 *
	 * @param poker The room to create the response for.
	 *
	 * @returns {VotesResponse} The response.
	 */
	public format( poker: string ): VotesResponse {
		const { voteCount, votes, groupedVoterNames } = this.pokersService.getVotes( poker );
		const votedNames = this.pokersService.getVotedNames( poker );

		const story: Story = this.pokersService.getStory( poker );

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
