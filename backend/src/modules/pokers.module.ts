import { Module } from "@nestjs/common";
import PokersService from "../services/pokers.service";
import PokersGateway from "../gateways/pokers.gateway";
import SocketUsersService from "../services/socket.users.service";
import HistoryResponseAdapter from "../adapters/history.response.adapter";
import MembersResponseAdapter from "../adapters/members.response.adapter";
import VoteResponseAdapter from "../adapters/vote.response.adapter";

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
