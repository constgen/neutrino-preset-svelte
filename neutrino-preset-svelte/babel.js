'use strict'

let ramda = require('ramda')
// let path = require('path')

module.exports = function (neutrino, options) {
	let config = neutrino.config
	let browsers = ramda.path(['options', 'compile', 'targets', 'browsers'], neutrino)
	// let NODE_MODULES = path.join(__dirname, 'node_modules')

	options = options || {}
	if (!browsers) {
		Object.assign(neutrino.options, {
			compile: {
				targets: {
					browsers: [
						'last 2 Chrome versions',
						'last 2 Firefox versions',
						'last 2 Edge versions',
						'last 2 Opera versions',
						'last 2 Safari versions',
						'last 2 iOS versions'
					]
				}
			}
		})
	}
	config.module.rule('compile')
		.test(/\.(js)$/)
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
					// [
					// 	require.resolve('babel-preset-es2015'), { modules: false }
					// ],
					[require.resolve('babel-preset-env'), {
						modules: false,
						useBuiltIns: true,
						include: ['transform-regenerator'],
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