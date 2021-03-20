import { Module } from "@nestjs/common";
import { PokersService } from "./pokers.service";
import { PokersGateway } from "./pokers.gateway";
import HistoryResponseFormattingService from "./history.response.formatting.service";
import MembersResponseFormattingService from "./members.response.formatting.service";
import VoteResponseFormattingService from "./vote.response.formatting.service";

@Module( {
	providers: [
		PokersGateway,
		PokersService,
		VoteResponseFormattingService,
		MembersResponseFormattingService,
		HistoryResponseFormattingService
	],
} )

// eslint-disable-next-line require-jsdoc
export class PokersModule {}
