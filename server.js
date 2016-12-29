const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const opn = require('opn')

const baseConfig = require('./webpack.config.js')

// const host = '127.0.0.1'
const host = '0.0.0.0'
const port = 1225
const addr = `http://${host}:${port}`
const config = Object.assign({}, baseConfig, {
  devtool: 'inline-source-map',
  entry: [
    `webpack-dev-server/client?${addr}`,
    'webpack/hot/only-dev-server',
    ...baseConfig.entry
  ],
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('style.css'),
    new webpack.HotModuleReplacementPlugin()
  ]
})

new WebpackDevServer(webpack(config), {
  contentBase: 'src/static',
  stats: config.stats,
  publicPath: '/', // config.output.publicPath,
  hot: true,
  historyApiFallback: true
}).listen(port, host, (err) => {
  if (err) {
    return console.error(err)
  }

  console.log(`Listening on ${addr}`)
  opn(addr)
})
