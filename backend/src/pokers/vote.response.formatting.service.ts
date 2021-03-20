import { Injectable } from "@nestjs/common";
import { Story, Vote, VoteValue } from "./poker.story.service";
import { GroupVoteNames, PokersService } from "./pokers.service";

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
export default class VoteResponseFormattingService {
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
	public formatVotesResponse( poker: string ): VotesResponse {
		const { voteCount, votes, groupedVoterNames } = this.pokersService.getVotes( poker );
		const story: Story = this.pokersService.getStory( poker );

		return {
			votes: this.formatVoteResponseList( votes ),
			voteCount,
			groupedVoterNames,
			votedNames: this.pokersService.getVotedNames( poker ),
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
	public formatVoteResponseList( votes: Vote[] ): VoteResponse[] {
		return votes.map( this.formatVoteResponse );
	}

	/**
	 * Formats a vote for the response.
	 *
	 * @param {Vote} vote The vote.
	 *
	 * @returns {VoteResponse} The formatted vote.
	 */
	private formatVoteResponse( vote: Vote ): VoteResponse {
		return {
			currentValue: vote.currentValue,
			initialValue: vote.initialValue,
			voterName: vote.voter.name,
		};
	}
}
