module.exports = {
	parser: "vue-eslint-parser",
	parserOptions: {
		parser: "@typescript-eslint/parser",
		project: "tsconfig.json",
		sourceType: "module",
		extraFileExtensions: [ ".vue" ],
	},
	plugins: [ "@typescript-eslint/eslint-plugin" ],
	"extends": [
		'yoast-base',
		'yoast-typescript',
	],
	root: true,
	env: {
		node: true,
		jest: true,
	},
	rules: {
		"@typescript-eslint/interface-name-prefix": "off",
		"@typescript-eslint/explicit-function-return-type": "off",
		"@typescript-eslint/explicit-module-boundary-types": "off",
		"@typescript-eslint/no-explicit-any": "off",
		"new-cap": "off", // Doesn't work with Types.
		"no-unused-vars": "off", // Normal no-unused-vars doesn't work for TypeScript
		"@typescript-eslint/no-unused-vars": "error",
		"no-dupe-class-members": "off", // Duplicate class members are overloads and are allowed in TypeScript
		ident: "off", // Normal indent doesn't work for TypeScript
		"@typescript-eslint/indent": [
			2,
			"tab",
			{
				SwitchCase: 1,
			},
		],
		// Allow space before async arrow function
		"space-before-function-paren": [
			"error",
			{
				anonymous: "never",
				named: "never",
				asyncArrow: "always",
			},
		],
	},
	settings: {
		react: { // Stupid, but required for extending the `Yoast` eslint config.
			version: "16.8",
		},
	},
	overrides: [
		{
			files: ["frontend/src/**/*.vue"], // Or *.test.js
			rules: {
		  	"require-jsdoc": 0,
		  	"no-alert": 0,
			}
		},
		{
			files: ["frontend/src/index.js"], // Or *.test.js
			rules: {
				"require-jsdoc": 0,
				"no-inline-comments": 0,
			}
		}
	],
};
