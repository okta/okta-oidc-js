const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './src/browser.js',
  output: {
    path: path.resolve('./dist'),
    filename: 'jwt.min.js'
  },
  target: 'web',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            forceEnv: 'browser'
          }
        }
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin()
  ]
};