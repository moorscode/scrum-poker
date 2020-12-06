module.exports = {
	extends: [
		'yoast-base',
		'yoast-typescript',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
  		project: 'tsconfig.json',
  		ecmaVersion: 2018,
		  sourceType: 'module',
	},
};
