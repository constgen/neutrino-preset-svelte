const neutrino = require('neutrino').Neutrino;

module.exports = neutrino({ cwd: __dirname })
  .use('.neutrinorc.js')
  .call('eslintrc');