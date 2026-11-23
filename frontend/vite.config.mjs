import vue from "@vitejs/plugin-vue2";
import { readdirSync } from "fs";
import { basename, join, resolve } from "path";
import { compile } from "sass";
import { defineConfig, loadEnv } from "vite";

const root = import.meta.dirname;
const themesDir = join( root, "src/css" );

/**
 * Lists the theme stylesheets.
 *
 * @returns {string[]} The theme names, e.g. "default" for src/css/default.scss.
 */
const listThemes = () => readdirSync( themesDir )
	.filter( ( file ) => file.endsWith( ".scss" ) )
	.map( ( file ) => basename( file, ".scss" ) );

/**
 * Serves every theme as a standalone stylesheet at /css/<theme>.css.
 *
 * The theme picker switches themes by swapping that URL, so these files need
 * stable, unhashed names instead of going through the module graph.
 *
 * @returns {import("vite").Plugin} The plugin.
 */
const themeStylesheets = () => ( {
	name: "theme-stylesheets",

	configureServer( server ) {
		server.watcher.add( themesDir );
		server.watcher.on( "change", ( file ) => {
			if ( file.startsWith( themesDir ) ) {
				server.ws.send( { type: "full-reload" } );
			}
		} );

		server.middlewares.use( ( request, response, next ) => {
			const match = /^\/css\/([\w-]+)\.css$/.exec( request.url.split( "?" )[ 0 ] );
			if ( ! match || ! listThemes().includes( match[ 1 ] ) ) {
				next();
				return;
			}

			try {
				const { css } = compile( join( themesDir, `${ match[ 1 ] }.scss` ) );
				response.setHeader( "Content-Type", "text/css" );
				response.end( css );
			} catch ( error ) {
				next( error );
			}
		} );
	},

	generateBundle() {
		for ( const theme of listThemes() ) {
			const { css } = compile( join( themesDir, `${ theme }.scss` ), { style: "compressed" } );
			this.emitFile( { type: "asset", fileName: `css/${ theme }.css`, source: css } );
		}
	},
} );

export default defineConfig( ( { mode } ) => {
	// The ports live in the project's .env, shared with the server.
	const env = loadEnv( mode, resolve( root, ".." ), "" );

	return {
		root,
		plugins: [ vue(), themeStylesheets() ],
		resolve: {
			extensions: [ ".mjs", ".js", ".ts", ".json", ".vue" ],
		},
		build: {
			outDir: resolve( root, "../dist/frontend" ),
			emptyOutDir: true,
		},
		server: {
			port: Number( env.SOCKET_PORT ) || 9000,
			proxy: {
				"/socket.io": {
					target: `http://localhost:${ env.SERVER_PORT || 3000 }`,
					ws: true,
				},
			},
		},
	};
} );
