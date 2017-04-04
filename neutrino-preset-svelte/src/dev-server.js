'use strict'

let ramda = require('ramda')
let hot = require('neutrino-middleware-hot')

module.exports = function (neutrino) {
	neutrino.use(hot)

	let config = neutrino.config
	let server = ramda.pathOr({}, ['options', 'server'], neutrino)
	let protocol = process.env.HTTPS ? 'https' : 'http'
	let host = process.env.HOST || server.host || '0.0.0.0'
	let port = process.env.PORT || server.host || 5000
	let https = (protocol === 'https') || server.https

	config.devServer
		.host(String(host))
		.port(Number(port))
		.https(Boolean(https))
		.contentBase(neutrino.options.source)
		.historyApiFallback(true)
		.hot(true)
		.stats({
			assets: false,
			children: false,
			chunks: false,
			colors: true,
			errors: true,
			errorDetails: true,
			hash: false,
			modules: false,
			publicPath: false,
			timings: false,
			version: false,
			warnings: true
		})

		config.entry('index')
			.add(`webpack-dev-server/client?${protocol}://${host}:${port}/`)
			.add('webpack/hot/dev-server')
}