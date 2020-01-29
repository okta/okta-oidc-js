var path = require('path')
var webpack = require('webpack')
var UglifyJsPlugin = require('uglifyjs-webpack-plugin')
var VueLoaderPlugin = require('vue-loader/lib/plugin')

module.exports = {
  entry: './src/okta-vue.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'okta-vue.js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['*', '.js', '.vue', '.json']
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map',
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        sourceMap: true,
        uglifyOptions: {
          compress: {
            warnings: false
          }
        }
      })
    ]
  }
}

if (process.env.NODE_ENV === 'production') {
  module.exports.devtool = '#source-map'
  // http://vue-loader.vuejs.org/en/workflow/production.html
  module.exports.plugins = (module.exports.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new VueLoaderPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  ])
}
