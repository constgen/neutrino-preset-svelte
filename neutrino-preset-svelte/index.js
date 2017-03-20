'use strict'

var loaderMerge = require('neutrino-middleware-loader-merge')
var web = require('neutrino-preset-web')
var path = require('path')
var svelte = require('neutrino-middleware-svelte-loader')

module.exports = function (neutrino) {
	var config = neutrino.config
	var NODE_MODULES = path.join(process.cwd(), 'node_modules')

	neutrino.use(web)
	neutrino.use(svelte)

	// config.module.rule('style')
	// 	.uses.clear()

	// config.module.rule('style')

	config.module.rule('compile')
		.test(/\.(js)$/)
		.include
			.add(neutrino.options.source)
			.add(neutrino.options.tests)
			.end()
		.exclude
			.add(NODE_MODULES)
			.end()
		.use('babel')
			.loader(require.resolve('babel-loader'))
			.options({
				presets: [
					[
						require.resolve('babel-preset-es2015'), { modules: false }
					]
				],
				plugins: [
					require.resolve('babel-plugin-transform-object-rest-spread'),
					require.resolve('babel-plugin-transform-class-properties')
				]
			})
			.end()

	config.resolve.extensions.add('.js')

	// neutrino.use(loaderMerge('compile', 'babel'), {
	// 	presets: [
	// 		[require.resolve('babel-preset-es2015'), { modules: false }]
	// 	],
	// 	plugins: [
	// 		require.resolve('babel-plugin-transform-object-rest-spread'),
	// 		require.resolve('babel-plugin-transform-class-properties')
	// 	],
	// 	env: {
	// 		development: {
	// 			//plugins: [require.resolve('react-hot-loader/babel')]
	// 		}
	// 	}
	// })

	// console.log(config.toConfig().module.rules[config.toConfig().module.rules.length-1])

	config.resolve.modules.add(NODE_MODULES)
	
	if (process.env.NODE_ENV === 'development') {
		// config
		// 	.entry('index')
		// 	.prepend(require.resolve('react-hot-loader/patch'));
	}

	if (config.module.rules.has('lint')) {
		// neutrino.use(loaderMerge('lint', 'eslint'), {
		// 	plugins: ['react'],
		// 	baseConfig: {
		// 		extends: ['plugin:react/recommended']
		// 	},
		// 	parserOptions: {
		// 		ecmaFeatures: {
		// 			experimentalObjectRestSpread: true
		// 		}
		// 	},
		// 	rules: {
		// 		'react/prop-types': ['off'],
		// 		'jsx-quotes': ['error', 'prefer-double'],
		// 		'class-methods-use-this': ['error', {
		// 			exceptMethods: [
		// 				'render',
		// 				'getInitialState',
		// 				'getDefaultProps',
		// 				'getChildContext',
		// 				'componentWillMount',
		// 				'componentDidMount',
		// 				'componentWillReceiveProps',
		// 				'shouldComponentUpdate',
		// 				'componentWillUpdate',
		// 				'componentDidUpdate',
		// 				'componentWillUnmount'
		// 			]
		// 		}]
		// 	}
		// });
	}
}