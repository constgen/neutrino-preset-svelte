'use strict'

let HtmlWebpackPlugin = require('html-webpack-plugin')
let ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin')
let merge = require('deepmerge')
let path = require('path')

module.exports = function (neutrino) {
	neutrino.config
		.plugin('html')
			.use(HtmlWebpackPlugin, [merge({
				filename: 'index.html',
				template: path.resolve(__dirname, 'template.ejs'),
				inject: 'head',
				mobile: true,
				minify: {
					collapseWhitespace: true, 
					preserveLineBreaks: true
				}
			}, neutrino.options.html || {})])
			.end()
		.plugin('html-defer')
			.use(ScriptExtHtmlWebpackPlugin, [{
				defaultAttribute: 'defer'
			}])
			.end()
}