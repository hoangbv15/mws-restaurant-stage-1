const path = require('path');

module.exports = {
  mode: 'development',
  entry: {
    main: './src/js/main.js',
    restaurant: './src/js/restaurant_info.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js']
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist',
    compress: true
  }
};
