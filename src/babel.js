let path = require('path');

let arrify = require('arrify');
let deepmerge = require('deepmerge');

module.exports = function (neutrino, settings = {}) {
	const NODE_MODULES = path.resolve(__dirname, '../node_modules');
	let config = neutrino.config;
	let targets = settings.targets || {};
	let compileRule = config.module.rule('compile');
	let compileRuleExtensions = arrify(compileRule.get('test'));
	let linkedMode = !path.relative(process.cwd(), require.resolve('babel-loader')).startsWith('node_modules');

	compileRule
		.test(compileRuleExtensions.concat(/\.js$/))
		.include
			.merge(settings.include || [])
			.end()
		.exclude
			.add(NODE_MODULES)
			.merge(settings.exclude || [])
			.end()
		.use('babel')
			.loader(require.resolve('babel-loader'))
			.tap((opts = {}) => deepmerge(opts, {
				presets: [
					[require.resolve('babel-preset-env'), {
						debug: false,
						loose: false,
						modules: false,
						useBuiltIns: true,
						include: [],

						exclude: [linkedMode && 'transform-es2015-classes'].filter(Boolean),
						targets
					}]
				],
				plugins: [
					require.resolve('babel-plugin-syntax-dynamic-import'),
					require.resolve('babel-plugin-transform-object-rest-spread'),
					require.resolve('babel-plugin-transform-class-properties')
				]
			}))
			.end();
};