'use strict'

let hot = require('neutrino-middleware-hot')
let open = require('opn')
let dns = require('dns')
let os = require('os')

let platformHostName = os.hostname()
let whenIPReady = new Promise (function(done, failed){
	dns.lookup(platformHostName, function (err, ip) {
		if (err) {
			return failed(err)
		}
		done(ip)
	})
})

module.exports = function (neutrino, options = {}) {
	neutrino.use(hot)

	let config = neutrino.config
	let protocol = process.env.HTTPS ? 'https' : 'http'
	let host = process.env.HOST || options.host || '0.0.0.0'
	let port = process.env.PORT || options.port || 5000
	let https = (protocol === 'https') || options.https
	let openInBrowser = (options.open === undefined) ? true : options.open

	config.devServer
		.host(String(host))
		.port(Number(port))
		.https(Boolean(https))
		.contentBase(neutrino.options.source)
		.historyApiFallback(true)
		.hot(true)
		.headers({
			host: host
		})
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

	config.entry('index')
		.add(`${require.resolve('webpack-dev-server/client')}?${protocol}://${host}:${port}/`)
		.add(require.resolve('webpack/hot/dev-server'))

	if (openInBrowser) {
		neutrino.on('start', function() {
			let serverHost = config.devServer.get('host')
			let serverPort = config.devServer.get('port')
			let serverProtocol = config.devServer.get('https') ? 'https' : 'http'
			if (serverHost === '0.0.0.0') {
				whenIPReady.then(function(ip){
					return `${serverProtocol}://${ip}:${serverPort}` 
				}).then(open)
			}
			else {
				open(`${serverProtocol}://${serverHost}:${serverPort}`)
			}
		})
	}
}