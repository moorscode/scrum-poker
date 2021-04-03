import { Injectable } from "@nestjs/common";
import { Story } from "../services/PokerStoryHandler";
import PokersService from "../services/PokersService";
import VoteResponseAdapter, { VoteResponse } from "./VoteResponseAdapter";

export interface HistoryResponse {
	name: string;
	votes: VoteResponse[];
	voteAverage?: number | string;
}

export interface HistoryResponseList {
	stories: HistoryResponse[];
}

@Injectable()
/**
 * The history response adapter.
 */
export default class HistoryResponseAdapter {
	/**
	 * Constructor
	 *
	 * @param {PokersService} pokersService The Poker service.
	 */
	constructor(
		private readonly pokersService: PokersService,
		private readonly voteResponseFormattingService: VoteResponseAdapter,
	) {}

	/**
	 * Formats the response.
	 *
	 * @param {string} room The room to format the response for.
	 *
	 * @returns {HistoryResponseList} The history list.
	 */
	public format( room: string ): HistoryResponseList {
		return { stories: this.formatHistoryList( this.pokersService.getHistory( room ) ) };
	}

	/**
	 * Formats stories for response.
	 *
	 * @param {Story[]} stories The stories to format.
	 *
	 * @returns {HistoryResponse[]} The formatted list.
	 */
	private formatHistoryList( stories: Story[] ): HistoryResponse[] {
		return stories.map( this.formatHistoryEntry.bind( this ) );
	}

	/**
	 * Formats a story for response.
	 *
	 * @param {Story} story The story to format.
	 *
	 * @returns {HistoryResponse} The formatted story.
	 */
	private formatHistoryEntry( story: Story ): HistoryResponse {
		return {
			name: story.name,
			votes: this.voteResponseFormattingService.formatVoteList( story.votes ),
			voteAverage: story.voteAverage,
		};
	}
}