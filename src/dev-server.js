let opn = require('opn');
let hot = require('@neutrinojs/hot');
let ip = require('ip');

module.exports = function (neutrino, settings = {}) {
	let https = Boolean(settings.https);
	let port = Number(settings.port || 5000);
	let serverIsPublic = settings.public === undefined ? false : Boolean(settings.public);
	let host = serverIsPublic ? '0.0.0.0' : 'localhost';
	let toOpenInBrowser = settings.open === undefined ? true : Boolean(settings.open);
	let publicHost = ip.address('public', 'ipv4');
	let livereload = settings.hot === undefined ? true : Boolean(settings.hot);

	neutrino.config.devServer
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
				let secured = devServer.get('https');
				let protocol = secured ? 'https' : 'http';
				let serverHost = devServer.get('host');
				let localHost = serverHost === '0.0.0.0' ? publicHost : serverHost;
				let localPort = devServer.get('port');

				opn(`${protocol}://${localHost}:${localPort}`, { wait: false });
			});
		})
		.end()
	.when(livereload, function (config) {
		let secured = config.devServer.get('https');
		let protocol = secured ? 'https' : 'http';
		let serverHost = config.devServer.get('host');
		let localPort = config.devServer.get('port');

		neutrino.use(hot);
		Object.keys(neutrino.options.mains)
			.forEach(function (key) {
				config.entry(key).prepend(require.resolve('webpack/hot/dev-server'));
				config.entry(key).prepend(`${require.resolve('webpack-dev-server/client')}?${protocol}://${serverHost}:${localPort}`);
			});
	});
};