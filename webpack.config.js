const path = require('path');
const pkg = require('./package.json');
const webpack = require('webpack');

const baseConfig = {
  entry: './src/index.js',
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      __VERSION__: JSON.stringify(pkg.version),
    }),
  ],
};

module.exports = [
  // Unminified — for debugging
  {
    ...baseConfig,
    output: {
      filename: 'voice-satellite-card.js',
      path: path.resolve(__dirname),
    },
    optimization: {
      minimize: false,
    },
    devtool: 'source-map',
  },
  // Minified — for production
  {
    ...baseConfig,
    output: {
      filename: 'voice-satellite-card.min.js',
      path: path.resolve(__dirname),
    },
    optimization: {
      minimize: true,
    },
  },
];