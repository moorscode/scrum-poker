import { Injectable } from "@nestjs/common";
import { Story } from "../services/Poker/PokerStoryHandler";
import VoteResponseAdapter, { VoteResponse } from "./VoteResponseAdapter";

export type HistoryResponse = {
	name: string;
	votes: VoteResponse[];
	voteAverage?: number | string;
}

export type HistoryResponseList = {
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
	 * @param {VoteResponseAdapter} voteResponseFormattingService The vote repsonse formatting service.
	 */
	constructor( private readonly voteResponseFormattingService: VoteResponseAdapter ) {
	}

	/**
	 * Formats the response.
	 *
	 * @param {Story[]} history The room history.
	 *
	 * @returns {HistoryResponseList} The history list.
	 */
	public format( history: Story[] ): HistoryResponseList {
		return { stories: this.formatHistoryList( history ) };
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
