const path = require('path');
const nodeExternals = require('webpack-node-externals');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  target: 'node',
  mode: 'production',
  entry: './app.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'server.js',
    clean: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    },
    extensions: ['.js']
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [
              ["transform-remove-console", { "exclude": [ "error", "warn" ] }]
            ]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
          mangle: {
            toplevel: true,
            safari10: true
          }
        },
        extractComments: false
      }),
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify('production')
    }),
    
    new JavaScriptObfuscator({
      rotateStringArray: true,
      stringArray: true,
      stringArrayEncoding: ['base64'],
      stringArrayThreshold: 0.8,
      transformObjectKeys: true,
      unicodeEscapeSequence: false,
      selfDefending: true,
      disableConsoleOutput: true
    }),
    
    new CopyPlugin({
      patterns: [
        { from: 'uploads', to: 'uploads' }
      ],
    })
  ],
  stats: 'errors-only'
};