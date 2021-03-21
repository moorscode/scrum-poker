import { Module } from "@nestjs/common";
import { PokersModule } from "./pokers.module";
import PointsService from "../services/points.service";
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
export class AppModule {}
