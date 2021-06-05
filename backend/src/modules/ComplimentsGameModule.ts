import { Module } from "@nestjs/common";
import ComplimentsGameGateway from "../gateways/ComplimentsGameGateway";
import SocketUserHandler from "../services/SocketUsersHandler";

@Module( {
	providers: [
		ComplimentsGameGateway,
		SocketUserHandler,
	],
} )

// eslint-disable-next-line require-jsdoc
export default class ComplimentsGameModule {
}
