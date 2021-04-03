import { Module } from "@nestjs/common";
import { PokersModule } from "./PokersModule";
import PointsProvider from "../services/PointsProvider";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

@Module( {
	imports: [
		ConfigModule.forRoot(),
		PokersModule,
		ScheduleModule.forRoot(),
	],
	controllers: [],
	providers: [
		PointsProvider,
	],
} )

// eslint-disable-next-line require-jsdoc
export class MainModule {}
