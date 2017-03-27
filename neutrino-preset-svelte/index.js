'use strict'

let path = require('path')
let loaderMerge = require('neutrino-middleware-loader-merge')
let svelte = require('neutrino-middleware-svelte-loader')
let chunk = require('neutrino-middleware-chunk')
let clean = require('neutrino-middleware-clean')
let minify = require('neutrino-middleware-minify')
let copy = require('neutrino-middleware-copy')
let styleLoader = require('neutrino-middleware-style-loader')
let fontLoader = require('neutrino-middleware-font-loader')
let imageLoader = require('neutrino-middleware-image-loader')
let env = require('neutrino-middleware-env')
let htmlTemplate = require('neutrino-middleware-html-template')
let namedModules = require('neutrino-middleware-named-modules')
let devServer = require('./dev-server.js')
let babel = require('./babel.js')

module.exports = function (neutrino) {
	neutrino.use(env)

	const NODE_MODULES = path.join(__dirname, 'node_modules')
	const PROJECT_NODE_MODULES = path.join(process.cwd(), 'node_modules')
	let config = neutrino.config
	let testRun = (process.env.NODE_ENV === 'test')
	let devRun = (process.env.NODE_ENV === 'development')
	let lintRule = config.module.rules.get('lint')

	config.devtool(devRun ? 'eval-source-map' : 'source-map')
	config
		.target('web')
		.context(neutrino.options.root)
		.entry('polyfill')
		 	.add(require.resolve('./polyfills.js'))
		 	.end()
		.entry('index')
			//.add(require.resolve('babel-polyfill'))
			.add(neutrino.options.entry)
			.end()
	config.output
		.path(neutrino.options.output)
		.publicPath('./')
		.filename('[name].bundle.js')
		.chunkFilename('[id].[chunkhash].js')

	neutrino.use(babel, {include: [neutrino.options.source, neutrino.options.tests, require.resolve('./polyfills.js')]})
	neutrino.use(svelte, {include: [neutrino.options.source, neutrino.options.tests]})
	neutrino.use(styleLoader)
	neutrino.use(fontLoader)
	neutrino.use(imageLoader)
	neutrino.use(namedModules)
	neutrino.use(htmlTemplate, neutrino.options.html)
	if (!testRun) {
		neutrino.use(chunk)
	}

	config.resolve.extensions.add('.js').add('.json')
	config.resolve.modules.add('node_modules').add(NODE_MODULES).add(PROJECT_NODE_MODULES).add(neutrino.options.node_modules)
	config.resolveLoader.modules.add(NODE_MODULES).add(PROJECT_NODE_MODULES).add(neutrino.options.node_modules)

	config.node
		.set('console', false)
		.set('global', true)
		.set('process', true)
		.set('Buffer', true)
		.set('__filename', 'mock')
		.set('__dirname', 'mock')
		.set('setImmediate', true)
		.set('fs', 'empty')
		.set('tls', 'empty');

	if (devRun) {
		neutrino.use(devServer)
	} 
	else {
		neutrino.use(clean, { paths: [neutrino.options.output] })
		neutrino.use(minify)
		config.output.filename('[name].[chunkhash].bundle.js')
	}

	if (lintRule) {
		if (lintRule.uses.get('eslint')) {
			let lintRuleExtensions = lintRule.get('test')
			let svelteRuleExtensions = [config.module.rule('svelte').get('test')]
			lintRuleExtensions = (lintRuleExtensions instanceof Array) ? lintRuleExtensions : [lintRuleExtensions]
			let ruleExtensions = lintRuleExtensions.concat(svelteRuleExtensions)
			
			lintRule
				.pre()
				.test(ruleExtensions)
			neutrino.use(loaderMerge('lint', 'eslint'), {
				plugins: ['html'],
				settings: {
					'html/html-extensions': ['.svelte', '.html', '.htm']
				},
				parserOptions: {
					ecmaFeatures: {
						experimentalObjectRestSpread: true
					}
				}
			})
			neutrino.use(loaderMerge('lint', 'eslint'), {
				globals: ['Buffer'],
				envs: ['browser', 'commonjs']
			})
		}
	}

	// console.log(config.toConfig().module.rules)
}