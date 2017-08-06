'use strict'

let path = require('path')
let svelte = require('neutrino-middleware-svelte-loader')
let chunk = require('neutrino-middleware-chunk')
let clean = require('neutrino-middleware-clean')
let copy = require('neutrino-middleware-copy')
let minify = require('neutrino-middleware-minify')
let styleLoader = require('neutrino-middleware-style-loader')
let fontLoader = require('neutrino-middleware-font-loader')
let imageLoader = require('neutrino-middleware-image-loader')
let env = require('neutrino-middleware-env')
let merge = require('deepmerge')
let arrify = require('arrify')

let devServer = require('./dev-server.js')
let babel = require('./babel.js')
let progress = require('./progress.js')
let htmlTemplate = require('./html-template.js')

module.exports = function (neutrino, options = {}) {
	const LOADER_EXTENSIONS = /\.(html?|svelte|svlt)$/
	const NODE_MODULES = path.resolve(__dirname, '../node_modules')
	const PROJECT_NODE_MODULES = path.resolve(process.cwd(), 'node_modules')
	let config = neutrino.config
	let testRun = (process.env.NODE_ENV === 'test')
	let devRun = (process.env.NODE_ENV === 'development')
	let lintRule = config.module.rules.get('lint')
	let eslintLoader = lintRule && lintRule.uses.get('eslint')
	let lintExtensions = arrify(lintRule && lintRule.get('test')).concat(LOADER_EXTENSIONS)

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
		targets: {
			browsers: options.browsers
		}
	})
	neutrino.use(svelte, {
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
		neutrino.use(devServer, merge({ public: true }, options.server))
	}
	else {
		neutrino.use(progress)
		neutrino.use(clean, { paths: [neutrino.options.output] })
		neutrino.use(minify)
		neutrino.use(copy, {
			patterns: [{
				context: neutrino.options.static,
				from: '**/*',
				to: path.basename(neutrino.options.static)
			}]
		})
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
				envs: ['browser', 'commonjs']
			}))
	}

	if (eslintLoader) {
		lintRule
			.pre()
			.test(lintExtensions)
		eslintLoader
			.tap(options => merge(options, {
				plugins: ['html'],
				settings: {
					'html/html-extensions': ['.html', '.htm', '.svelte', '.svlt']
				}
			}))
			.end()
	}

	// console.log(config.toConfig().module.rules)
}