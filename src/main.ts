import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { join } from "path";

/**
 * Bootstraps the application.
 *
 * @returns {Promise<void>} Listen for a connection.
 */
async function bootstrap() {
	const app = await NestFactory.create<NestExpressApplication>( AppModule );
	app.useStaticAssets( join( __dirname, "..", "html" ) );
	await app.listen( process.env.SERVER_PORT || 3000 );
}

bootstrap();
