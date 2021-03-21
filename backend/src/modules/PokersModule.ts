import { Module } from "@nestjs/common";
import PokersService from "../services/PokersService";
import PokersGateway from "../gateways/PokersGateway";
import SocketUsersService from "../services/SocketUsersService";
import HistoryResponseAdapter from "../adapters/HistoryResponseAdapter";
import MembersResponseAdapter from "../adapters/MembersResponseAdapter";
import VoteResponseAdapter from "../adapters/VoteResponseAdapter";

@Module( {
	providers: [
		PokersGateway,
		PokersService,
		VoteResponseAdapter,
		MembersResponseAdapter,
		HistoryResponseAdapter,
		SocketUsersService,
	],
} )

// eslint-disable-next-line require-jsdoc
export class PokersModule {}
