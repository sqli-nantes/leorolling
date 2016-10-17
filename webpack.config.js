const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const merge = require('webpack-merge');
const validate = require('webpack-validator');
const configUtils = require('./libs/config-utils');
const pkg = require('./package.json');

const PATHS = {
  app: path.join(__dirname, 'app'),
  style: [
    path.join(__dirname, 'node_modules', 'purecss'),
    path.join(__dirname, 'app', 'example', 'component.css')
  ],
  build: path.join(__dirname, 'build')
};

const common = {
  entry: {
    style: PATHS.style,
    app: PATHS.app
  },
  output: {
    path: PATHS.build,
    filename: '[name].js'
  },
  plugins: [
    // Génération du point d'entrée (page HTML)
    new HtmlWebpackPlugin({
      title: 'Make Leo roll'
    })
  ]
};

var config;

switch (process.env.npm_lifecycle_event) {
  case 'build':
  case 'stats':
    config = merge(
      common, {
        devtool: 'source-map',
        output: {
          path: PATHS.build,
          filename: '[name].[chunkhash].js',
          chunkFilename: '[chunkhash].js'
        }
      },
      configUtils.clean(PATHS.build),
      configUtils.setFreeVariable('process.env.NODE_ENV', 'production'),
      configUtils.extractBundle({
        name: 'vendor',
        entries: Object.keys(pkg.dependencies)
      }),
      configUtils.minify(),
      configUtils.extractCSS(PATHS.style),
      configUtils.purifyCSS([PATHS.app])
    );
    break;
  default:
    config = merge(
      common, {
        devtool: 'eval-source-map'
      },
      configUtils.setupCSS(PATHS.style),
      configUtils.devServer({
        host: process.env.HOST,
        port: process.env.PORT
      })
    );
}

// Exécution du validateur en mode silencieux pour éviter du texte superflu
// vers des sorties json (et donc pour la commande 'stats')
module.exports = validate(config, {
  quiet: true
});
