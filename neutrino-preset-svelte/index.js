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
let namedModules = require('neutrino-middleware-named-modules')
let HtmlWebpackPlugin = require('html-webpack-plugin')
let ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
let devServer = require('./dev-server.js')
let babel = require('./babel.js')
let merge = require('merge')

module.exports = function (neutrino) {
	neutrino.use(env)

	const NODE_MODULES = path.join(__dirname, 'node_modules')
	const PROJECT_NODE_MODULES = path.join(process.cwd(), 'node_modules')
	let config = neutrino.config
	let testRun = (process.env.NODE_ENV === 'test')
	let devRun = (process.env.NODE_ENV === 'development')
	let lintRule = config.module.rules.get('lint')
	let eslintLoader = lintRule && lintRule.uses.get('eslint')
	let styleRule = config.module.rules.get('style')

	config
		.devtool(devRun ? 'eval-source-map' : 'source-map')
		.target('web')
		.context(neutrino.options.root)
		.entry('polyfill')
		 	.add(require.resolve('./polyfills.js'))
		 	.end()
		.entry('index')
			.add(neutrino.options.entry)
			.end()
		.output
			.path(neutrino.options.output)
			.publicPath('./')
			.filename('[name].bundle.js')
			.chunkFilename('[id].[chunkhash].js')
			.end()
		.resolve.extensions
			.add('.js')
			.add('.json')
			.end().end()
		.resolve.modules
			.add('node_modules')
			.add(NODE_MODULES)
			.add(PROJECT_NODE_MODULES)
			.add(neutrino.options.node_modules)
			.end().end()
		.resolveLoader.modules
			.add(NODE_MODULES)
			.add(PROJECT_NODE_MODULES)
			.add(neutrino.options.node_modules)
			.end().end()
		.node
			.set('console', false)
			.set('global', true)
			.set('process', true)
			.set('Buffer', true)
			.set('__filename', 'mock')
			.set('__dirname', 'mock')
			.set('setImmediate', true)
			.set('fs', 'empty')
			.set('tls', 'empty')
			.end()
		.plugin('html')
			.use(HtmlWebpackPlugin, [merge({
				filename: 'index.html',
				template: __dirname + '/template.ejs',
				inject: 'head',
				mobile: true,
				minify: {
					collapseWhitespace: true, 
					preserveLineBreaks: true
				}
			}, neutrino.options.html)])
			.end()
		.plugin('html-defer')
			.use(ScriptExtHtmlWebpackPlugin, [{
				defaultAttribute: 'defer'
			}])
			.end()

	neutrino.use(babel, {
		include: [
			neutrino.options.source, 
			neutrino.options.tests, 
			require.resolve('./polyfills.js')
		]
	})
	neutrino.use(svelte, {
		include: [neutrino.options.source, neutrino.options.tests]
	})
	neutrino.use(styleLoader)
	neutrino.use(fontLoader)
	neutrino.use(imageLoader)
	neutrino.use(namedModules)
		

	if (!testRun) {
		neutrino.use(chunk)
	}
	if (devRun) {
		neutrino.use(devServer)
	} 
	else {
		neutrino.use(clean, { paths: [neutrino.options.output] })
		neutrino.use(minify)
		config.output.filename('[name].[chunkhash].bundle.js')
	}

	if (eslintLoader) {	
		lintRule
			.pre()
			
		eslintLoader
			.tap(options => merge(options, {
				parserOptions: {
					ecmaFeatures: {
						experimentalObjectRestSpread: true
					}
				}
			}))
			.tap(options => merge(options, {
				globals: ['Buffer'],
				envs: ['browser', 'commonjs']
			}))
	}

	// console.log(config.toConfig().module.rules)
}