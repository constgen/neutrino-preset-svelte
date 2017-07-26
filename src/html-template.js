'use strict'

let HtmlWebpackPlugin = require('html-webpack-plugin')
let ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
let merge = require('deepmerge')
let path = require('path')

module.exports = function (neutrino, options = {}) {
	let manifest = require(path.resolve(process.cwd(), 'package.json'))
	let { name, version } = manifest

	neutrino.config
		.plugin('html')
			.use(HtmlWebpackPlugin, [merge({
				title: `${name} ${version || ''}`,
				filename: 'index.html',
				template: path.resolve(__dirname, 'template.ejs'),
				inject: 'head',
				mobile: true,
				minify: {
					collapseWhitespace: true, 
					preserveLineBreaks: true
				}
			}, options)])
			.end()
		.plugin('html-defer')
			.use(ScriptExtHtmlWebpackPlugin, [{
				defaultAttribute: 'defer'
			}])
			.end()
}