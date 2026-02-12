const path = require('path');

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