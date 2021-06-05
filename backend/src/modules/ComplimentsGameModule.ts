import { Module } from "@nestjs/common";
import ComplimentsGameGateway from "../gateways/ComplimentsGameGateway";
import CardsProvider from "../services/ComplimentsGame/CardsProvider";
import GameCleanupService from "../services/ComplimentsGame/GameCleanupService";
import GameHandler from "../services/ComplimentsGame/GameHandler";
import GameRoomCoordinator from "../services/ComplimentsGame/GameRoomCoordinator";
import GameService from "../services/ComplimentsGame/GameService";
import SocketUserHandler from "../services/SocketUsersHandler";

@Module( {
	providers: [
		CardsProvider,
		ComplimentsGameGateway,
		SocketUserHandler,
		GameService,
		GameCleanupService,
		GameRoomCoordinator,
		GameHandler,
	],
} )

// eslint-disable-next-line require-jsdoc
export default class ComplimentsGameModule {
}
