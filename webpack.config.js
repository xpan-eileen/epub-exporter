const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const StylelintWebpackPlugin = require('stylelint-webpack-plugin');

const transformManifest = require('./utils/transformManifest');
const { appPath, appSrc, appDist, appTest } = require('./utils/paths');
const { isProduction, isDevelopment } = require('./utils/env');

const babelLoader = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: isDevelopment,
  },
};

module.exports = {
  mode: isProduction ? 'production' : 'development',
  entry: {
    popup: path.join(appSrc, 'popup.tsx'),
    contentScript: path.join(appSrc, 'contentScript.ts'),
    background: path.join(appSrc, 'background.ts'),
  },
  output: { filename: '[name].js', path: appDist },
  devtool: isProduction ? false : 'inline-source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.join(appSrc, 'manifest.json'),
          to: path.join(appDist, 'manifest.json'),
          transform: transformManifest,
        },
      ],
    }),
    new HtmlWebpackPlugin({ filename: 'popup.html', template: path.join(appSrc, 'popup.html'), chunks: ['popup'] }),
    new StylelintWebpackPlugin({ context: appSrc }),
  ],
  module: {
    rules: [
      {
        test: /\.(ts|js)x?$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [{ loader: 'eslint-loader', options: { cache: true } }],
      },
      {
        test: /\.(css|sass|scss)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              sourceMap: isDevelopment,
              importLoaders: 2,
              modules: { mode: 'global' },
            },
          },
          {
            loader: 'postcss-loader',
            options: {
              sourceMap: isDevelopment,
              postcssOptions: {
                plugins: [
                  require('postcss-import')({ root: appPath }),
                  require('postcss-preset-env')(),
                  require('cssnano')(),
                ],
              },
            },
          },
          {
            loader: 'sass-loader',
            options: { sourceMap: isDevelopment, implementation: require('sass') },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          babelLoader,
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                module: 'ES2020',
              },
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [babelLoader],
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf|png|svg|jpg|gif)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    alias: {
      '@src': appSrc,
      '@test': appTest,
    },
  },
};
