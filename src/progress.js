'use strict'

let ProgressBarPlugin = require('progress-bar-webpack-plugin')

module.exports = function (neutrino) {
	neutrino.config
		.plugin('progress')
		.use(ProgressBarPlugin)
}