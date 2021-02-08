/* eslint-disable @typescript-eslint/no-var-requires */
const path = require( "path" );
const webpack = require( "webpack" );
const VueLoaderPlugin = require( "vue-loader/lib/plugin" );
const HtmlPlugin = require( "html-webpack-plugin" );
const CopyWebpackPlugin = require( "copy-webpack-plugin" );

const dotenv = require( "dotenv" ).config( {
	path: path.join( __dirname, "..", ".env" ),
} );

const config = {
	context: __dirname,
	entry: "./src/index.js",
	output: {
		path: path.resolve( process.cwd(), "dist/frontend" ),
		filename: "[name].[contenthash].js",
	},
	target: "web",
	module: {
		rules: [
			{
				test: /\.vue$/,
				loader: "vue-loader",
			},
		],
	},
	resolve: {
		extensions: [
			".js",
			".vue",
			".tsx",
			".ts",
		],
	},
	plugins: [
		new HtmlPlugin( {
			template: "./src/html/index.html",
		} ),
		new webpack.DefinePlugin( {
			"process.env": dotenv.parsed,
		} ),
		new VueLoaderPlugin(),
		new CopyWebpackPlugin( {
			 patterns: [
				{
					// Wildcard is specified hence will copy only css files
					from: "*.css",
					to: "css",
					context: "src/css",
				},
				{
					// Wildcard is specified hence will copy only css files
					from: "*.ico",
					to: "",
					context: "src/html",
				},
			] } ),
	],
	optimization: {
		runtimeChunk: "single",
		splitChunks: {
			cacheGroups: {
				vendor: {
					test: /[\\/]node_modules[\\/]/,
					name: "vendors",
					chunks: "all",
				},
			},
		},
	},
	devServer: {
		contentBase: path.join( __dirname, "public" ),
		compress: true,
		port: 9000,
	},
};

module.exports = config;
