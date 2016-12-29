const path = require('path')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  devtool: 'cheap-hidden-source-map',
  entry: [
    './src/app'
  ],
  output: {
    filename: 'lights.js',
    path: path.join(__dirname, 'dist'),
    publicPath: '/xmas/2016/'
  },
  module: {
    loaders: [
      {
        test: /\.ttf$/,
        loader: 'file-loader',
        query: {
          name: 'fonts/[name].[ext]',
          publicPath: './'
        }
      },
      {
        test: /\.styl$/,
        loader: ExtractTextPlugin.extract({
          fallbackLoader: 'style-loader',
          loader: [ 'css-loader', 'postcss-loader', 'stylus-loader' ]
        })
      },
      {
        test: /\.(jpg|png)$/,
        loaders: [
          {
            loader: 'file-loader',
            query: {
              name: 'img/[name].[sha1:hash:base64:7].[ext]',
              publicPath: './'
            }
          },
          {
            loader: 'image-webpack-loader',
            query: {
              optimizationLevel: 7,
              interlaced: false,
              pngquant: {quality: "65-80", speed: 4},
              mozjpeg: {quality: 65}
            }
          }
        ]
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(),
    new ExtractTextPlugin('style.css'),
    new webpack.optimize.UglifyJsPlugin({
      compress: { warnings: false }
    }),
    new webpack.DefinePlugin({
      'process.env': {NODE_ENV: JSON.stringify('production')}
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  resolve: {
    extensions: [ '*', '.js', '.styl' ]
  },
  stats: {
    chunkModules: false,
    colors: true
  }
}
