const path = require('path')

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    path: path.resolve(__dirname, './src'),
    filename: 'bundle.js',
  },
  devServer: {
    port: process.env.CLIENT_PORT || 8080,
    static: path.resolve(__dirname, './src'),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
    ],
  },
}