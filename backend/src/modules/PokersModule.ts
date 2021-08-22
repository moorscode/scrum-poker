import { Module } from "@nestjs/common";
import HistoryResponseAdapter from "../adapters/HistoryResponseAdapter";
import MembersResponseAdapter from "../adapters/MembersResponseAdapter";
import VoteResponseAdapter from "../adapters/VoteResponseAdapter";
import PokersGateway from "../gateways/PokersGateway";
import PokersCleanupService from "../services/PokersCleanupService";
import PokersService from "../services/PokersService";
import SocketUserHandler from "../services/SocketUsersHandler";
import PointProviderFactory from "../services/voting/PointProviderFactory";
import VoteValidationService from "../services/voting/VoteValidationService";

@Module( {
	providers: [
		PokersGateway,
		PokersService,
		PokersCleanupService,
		VoteResponseAdapter,
		VoteValidationService,
		PointProviderFactory,
		MembersResponseAdapter,
		HistoryResponseAdapter,
		SocketUserHandler,
	],
} )

// eslint-disable-next-line require-jsdoc
export class PokersModule {
}
