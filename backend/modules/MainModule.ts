import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { PokersModule } from "./PokersModule";

@Module( {
	imports: [
		ConfigModule.forRoot(),
		PokersModule,
		ScheduleModule.forRoot(),
	],
	controllers: [],
	providers: [],
} )

// eslint-disable-next-line require-jsdoc
export class MainModule {
}
