import { Injectable } from "@nestjs/common";
import { Story } from "./poker.story.service";
import { PokersService } from "./pokers.service";
import VoteResponseFormattingService, { VoteResponse } from "./vote.response.formatting.service";

export interface HistoryResponse {
	name: string;
	votes: VoteResponse[];
	voteAverage?: number | string;
}

export interface HistoryResponseList {
	stories: HistoryResponse[];
}

@Injectable()
export default class HistoryResponseFormattingService {
	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	constructor(
		private readonly pokersService: PokersService,
		private readonly voteResponseFormattingService: VoteResponseFormattingService,
	) {
	}

	/**
	 * 
	 * @param room The room to format the response for.
	 *
	 * @returns {HistoryResponseList} The history list.
	 */
	public formatHistoryResponse( room: string ): HistoryResponseList {
		return { stories: this.formatStoryHistoryResponseList( this.pokersService.getHistory( room ) ) };
	}

	/**
	 * Formats stories for response.
	 *
	 * @param {Story[]} stories The stories to format.
	 *
	 * @returns {HistoryResponse[]} The formatted list.
	 */
	private formatStoryHistoryResponseList( stories: Story[] ): HistoryResponse[] {
		return stories.map( this.formatStoryHistoryResponse.bind( this ) );
	}

	/**
	 * Formats a story for response.
	 *
	 * @param {Story} story The story to format.
	 *
	 * @returns {HistoryResponse} The formatted story.
	 */
	private formatStoryHistoryResponse( story: Story ): HistoryResponse {
		return {
			name: story.name,
			votes: this.voteResponseFormattingService.formatVoteResponseList( story.votes ),
			voteAverage: story.voteAverage,
		};
	}
}