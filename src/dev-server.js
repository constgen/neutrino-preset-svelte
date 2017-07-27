'use strict'

let opn = require('opn')
let hot = require('neutrino-middleware-hot')
let ip = require('ip')

module.exports = function (neutrino, options = {}) {
	neutrino.use(hot)

	let config = neutrino.config
	let https = options.https
	let protocol = https ? 'https' : 'http'
	let port = options.port || 5000
	let serverPublic = options.public !== undefined ? Boolean(options.public) : false
	let host = serverPublic ? '0.0.0.0' : 'localhost'
	let openInBrowser = options.open !== undefined ? Boolean(options.open) : true
	let contentBase = options.contentBase || neutrino.options.source
	let publicHost = ip.address('public', 'ipv4')

	config.devServer
		.host(host)
		.port(Number(port))
		.https(Boolean(https))
		.contentBase(contentBase)
		.historyApiFallback(true)
		.hot(true)
		.headers({
			host: publicHost
		})
						.public(publicHost) //.public(`${publicHost}:${port}`)
		.publicPath('/')
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
		.when(openInBrowser, function (devServer) {
			neutrino.on('start', function () {
				let https = devServer.get('https')
				let protocol = https ? 'https' : 'http'
				let host = devServer.get('host')
				let port = devServer.get('port')
				let localHost = host === '0.0.0.0' ? publicHost : host

				opn(`${protocol}://${localHost}:${port}`)
			})
		})
		.end()
	.entry('index')
		.prepend(require.resolve('webpack/hot/dev-server'))
		.prepend(`${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}`)
}
