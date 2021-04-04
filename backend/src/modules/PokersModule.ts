import { Module } from "@nestjs/common";
import PokersService from "../services/PokersService";
import PokersGateway from "../gateways/PokersGateway";
import SocketUserHandler from "../services/SocketUsersHandler";
import HistoryResponseAdapter from "../adapters/HistoryResponseAdapter";
import MembersResponseAdapter from "../adapters/MembersResponseAdapter";
import VoteResponseAdapter from "../adapters/VoteResponseAdapter";
import PokersCleanupService from "../services/PokersCleanupService";
import PointsProvider from "../services/PointsProvider";

@Module( {
	providers: [
		PokersGateway,
		PokersService,
		PokersCleanupService,
		PointsProvider,
		VoteResponseAdapter,
		MembersResponseAdapter,
		HistoryResponseAdapter,
		SocketUserHandler,
	],
} )

// eslint-disable-next-line require-jsdoc
export class PokersModule {}
