const path = require('path');

module.exports = {
  entry: './src/js/main.js',
  output: {
      path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
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
    contentBase: './dist'
  }
};
