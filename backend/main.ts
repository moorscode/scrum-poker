import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { dirname, join } from "path";
import { MainModule } from "./modules/MainModule";

/**
 * Bootstraps the application.
 *
 * @returns {Promise<void>} Listen for a connection.
 */
async function bootstrap() {
	const app = await NestFactory.create <NestExpressApplication>( MainModule );
	app.useStaticAssets( join( dirname( dirname( __dirname ) ), "dist/frontend" ) );
	await app.listen( process.env.SERVER_PORT || 3000 );
}

bootstrap();
