import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import PointsProvider from "../services/Poker/PointsProvider";
import PokersModule from "./PokersModule";
import ComplimentsGameModule from "./ComplimentsGameModule";

@Module( {
	imports: [
		ConfigModule.forRoot(),
		PokersModule,
		ComplimentsGameModule,
		ScheduleModule.forRoot(),
	],
	controllers: [],
	providers: [
		PointsProvider,
	],
} )

// eslint-disable-next-line require-jsdoc
export class MainModule {
}
