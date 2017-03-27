'use strict'

let ramda = require('ramda')
// let path = require('path')

module.exports = function (neutrino, options) {
	// const NODE_MODULES = path.join(__dirname, 'node_modules')
	let config = neutrino.config
	let browsers = ramda.path(['options', 'compile', 'targets', 'browsers'], neutrino)
	let compileRule = config.module.rules.get('compile')
	let compileRuleExtensions = compileRule && compileRule.get('test') || []
	compileRuleExtensions = (compileRuleExtensions instanceof Array) ? compileRuleExtensions : [compileRuleExtensions]

	options = options || {}
	if (!browsers) {
		Object.assign(neutrino.options, {
			compile: {
				targets: {
					browsers: [
						'last 3 chrome versions',
						'last 3 firefox versions',
						'last 3 edge versions',
						'last 3 opera versions',
						'last 3 safari versions',
						'last 1 ie version',
						'last 1 ie_mob version',
						'last 1 blackberry version',
						'last 3 and_chr versions',
						'last 3 and_ff versions',
						'last 3 op_mob versions',
						'last 2 op_mini versions',
						'ios >= 8',
						'android >= 4'
					]
				}
			}
		})
	}
	config.module.rule('compile')
		.test(compileRuleExtensions.concat(/\.(js)$/))
		.include
			.merge(options.include || [])
			.end()
		.exclude
			.merge(options.exclude || [])
			// .add(NODE_MODULES)
			.end()
		.use('babel')
			.loader(require.resolve('babel-loader'))
			.options({
				presets: [
					[require.resolve('babel-preset-env'), {
						debug: false,
						loose: false,
						modules: false,
						useBuiltIns: true,
						include: [],
						targets: neutrino.options.compile.targets
					}]
				],
				plugins: [
					require.resolve('babel-plugin-syntax-dynamic-import'),
					require.resolve('babel-plugin-transform-object-rest-spread'),
					require.resolve('babel-plugin-transform-class-properties')
				]
			})
			.end()
}