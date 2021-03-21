import { Module } from "@nestjs/common";
import { PokersModule } from "./PokersModule";
import PointsService from "../services/PointsService";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";

@Module( {
	imports: [
		ConfigModule.forRoot(),
		PokersModule,
		ScheduleModule.forRoot()
	],
	controllers: [],
	providers: [
		PointsService,
	],
} )

// eslint-disable-next-line require-jsdoc
export class MainModule {}
