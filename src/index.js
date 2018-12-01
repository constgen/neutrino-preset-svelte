'use strict'

let path = require('path')
let svelteLoader = require('neutrino-middleware-svelte-loader')
let chunk = require('@neutrinojs/chunk')
let clean = require('@neutrinojs/clean')
let copy = require('@neutrinojs/copy')
let minify = require('@neutrinojs/minify')
let styleLoader = require('@neutrinojs/style-loader')
let fontLoader = require('@neutrinojs/font-loader')
let imageLoader = require('@neutrinojs/image-loader')
let env = require('@neutrinojs/env')
let deepmerge = require('deepmerge')

let devServer = require('./dev-server.js')
let babel = require('./babel.js')
let progress = require('./progress.js')
let htmlTemplate = require('./html-template.js')

function merge(options = {}){
	return function(opts = {}){
		return deepmerge(opts, options)
	}
}

module.exports = function (neutrino, options = {}) {
	const NODE_MODULES = path.resolve(__dirname, '../node_modules')
	const PROJECT_NODE_MODULES = path.resolve(process.cwd(), 'node_modules')
	let config = neutrino.config
	let testRun = (process.env.NODE_ENV === 'test')
	let devRun = (process.env.NODE_ENV === 'development')
	let lintRule = config.module.rules.get('lint')
	let eslintLoader = lintRule && lintRule.uses.get('eslint')
	let staticDirPath = path.join(neutrino.options.source, 'static')

	config
		.devtool(devRun ? 'eval-source-map' : 'source-map')
		.target('web')
		.context(neutrino.options.root)
		.entry('polyfill')
			.add(require.resolve('./polyfills.js'))
			.end()
		.entry('index')
			.add(neutrino.options.mains.index)
			.end()
		.output
			.path(neutrino.options.output)
			.publicPath('./')
			.filename('[name].bundle.js')
			.chunkFilename('[name].[chunkhash].js')
			.end()
		.resolve.extensions
			.add('.js')
			.add('.json')
			.end().end()
		.resolve.alias
			// Make sure 2 versions of "core-js" always match in package.json and babel-polyfill/package.json
			.set('core-js', path.dirname(require.resolve('core-js')))
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
			.set('Buffer', false)
			.set('__filename', 'mock')
			.set('__dirname', 'mock')
			.set('setImmediate', true)
			.set('fs', 'empty')
			.set('tls', 'empty')
			.end()

	neutrino.use(env)
	neutrino.use(babel, {
		include: [
			neutrino.options.source,
			neutrino.options.tests,
			require.resolve('./polyfills.js')
		],
		exclude: [
			staticDirPath
		],
		targets: {
			browsers: options.browsers
		}
	})
	neutrino.use(svelteLoader, {
		include: [neutrino.options.source, neutrino.options.tests]
	})
	neutrino.use(htmlTemplate, options.html)
	neutrino.use(styleLoader)
	neutrino.use(fontLoader)
	neutrino.use(imageLoader)

	if (!testRun) {
		neutrino.use(chunk)
	}

	if (devRun) {
		neutrino.use(devServer, deepmerge({ public: true }, options.server || {}))
	}
	else {
		neutrino.use(progress)
		neutrino.use(clean, { paths: [neutrino.options.output] })
		neutrino.use(minify)
		neutrino.use(copy, {
			patterns: [{
				context: staticDirPath,
				from: '**/*',
				to: path.basename(staticDirPath)
			}]
		})
		config.output.filename('[name].[chunkhash].bundle.js')
	}

	if (eslintLoader) {
		lintRule
			.pre()
		eslintLoader
			.tap(merge({
				parserOptions: {
					ecmaFeatures: {
						experimentalObjectRestSpread: true
					}
				}
			}))
			.tap(merge({
				envs: ['browser', 'commonjs']
			}))
	}

	// console.log(config.toConfig().module.rules)
}