'use strict'

let opn = require('opn')
let hot = require('@neutrinojs/hot')
let ip = require('ip')

module.exports = function (neutrino, settings = {}) {
	let config = neutrino.config
	let https = Boolean(settings.https)
	let port = Number(settings.port || 5000)
	let serverIsPublic = settings.public === undefined ? false : Boolean(settings.public)
	let host = serverIsPublic ? '0.0.0.0' : 'localhost'
	let toOpenInBrowser = settings.open === undefined ? true : Boolean(settings.open)
	let publicHost = ip.address('public', 'ipv4')
	let livereload = settings.hot === undefined ? true : Boolean(settings.hot)

	config.devServer
		.host(host)
		.port(port)
		.https(https)
		.contentBase(neutrino.options.source)
		.historyApiFallback(true)
		.hot(livereload)
		.headers({
			host: publicHost
		})
		.public(publicHost)
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
		.when(toOpenInBrowser, function (devServer) {
			neutrino.on('start', function () {
				let https = devServer.get('https')
				let protocol = https ? 'https' : 'http'
				let host = devServer.get('host')
				let port = devServer.get('port')
				let localHost = host === '0.0.0.0' ? publicHost : host

				opn(`${protocol}://${localHost}:${port}`, { wait: false })
			})
		})
		.end()
	.when(livereload, function(config){
		let https = config.devServer.get('https')
		let protocol = https ? 'https' : 'http'
		let host = config.devServer.get('host')
		let port = config.devServer.get('port')

		neutrino.use(hot)
		Object.keys(neutrino.options.mains)
			.forEach(function (key) {
				config.entry(key).prepend(require.resolve('webpack/hot/dev-server'))
				config.entry(key).prepend(`${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}`)
			})
	})
}
