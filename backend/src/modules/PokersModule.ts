import { Module } from "@nestjs/common";
import HistoryResponseAdapter from "../adapters/HistoryResponseAdapter";
import MembersResponseAdapter from "../adapters/MembersResponseAdapter";
import VoteResponseAdapter from "../adapters/VoteResponseAdapter";
import PokersGateway from "../gateways/PokersGateway";
import PointsProvider from "../services/Poker/PointsProvider";
import PokersCleanupService from "../services/Poker/PokersCleanupService";
import PokersService from "../services/Poker/PokersService";
import SocketUserHandler from "../services/SocketUsersHandler";

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
export default class PokersModule {
}
