let path = require('path');

let HtmlWebpackPlugin = require('html-webpack-plugin');
let ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
let deepmerge = require('deepmerge');

module.exports = function (neutrino, settings = {}) {
	let { config } = neutrino;
	let manifest = require(path.resolve(process.cwd(), 'package.json'));
	let { name, version } = manifest;
	let chunkOrder = ['runtime', 'polyfill'];
	let entries = Object.keys(neutrino.options.mains);

	entries.forEach(function (entry, index) {
		config
			.plugin(`html-${index}`)
				.use(HtmlWebpackPlugin, [deepmerge({
					title: `${name} ${version || ''}`,
					filename: `${entry}.html`,
					template: path.resolve(__dirname, 'template.ejs'),
					inject: 'head',
					mobile: true,
					minify: {
						collapseWhitespace: true,
						preserveLineBreaks: true
					},
					chunksSortMode (chunkA, chunkB) {
						let indexA = chunkOrder.indexOf(chunkA.names[0]);
						let indexB = chunkOrder.indexOf(chunkB.names[0]);

						if (indexA < 0) {
							return 1;
						}
						if (indexB < 0) {
							return -1;
						}
						return indexA - indexB;
					}
				}, settings)])
				.end();
	});

	config
		.plugin('html-defer')
			.use(ScriptExtHtmlWebpackPlugin, [{
				defaultAttribute: 'defer'
			}])
			.end();
};