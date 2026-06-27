const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (_env, argv) => {
  const isDev = argv.mode === 'development';
  return {
    entry: {
      popup: './src/popup/index.tsx',
      background: './src/background/service-worker.ts',
      'content-linkedin': './src/content/linkedin.ts',
      'content-indeed': './src/content/indeed.ts',
      'content-whatsapp': './src/content/whatsapp.ts',
      'content-rozee': './src/content/rozee.ts',
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: 'ts-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: './src/popup/index.html',
        filename: 'popup.html',
        chunks: ['popup'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          { from: 'src/manifest.json', to: 'manifest.json' },
          { from: 'src/icons', to: 'icons' },
        ],
      }),
    ],
    devtool: isDev ? 'cheap-module-source-map' : false,
  };
};
