const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const { execSync } = require('child_process');

// Generate build metadata (used to verify at runtime the bundle in memory is fresh)
let GIT_HASH = 'unknown';
try {
  GIT_HASH = execSync('git rev-parse --short HEAD').toString().trim();
} catch (e) {
  // ignore (e.g., not a git repo in deployed artifact)
}
const BUILD_TIME = new Date().toISOString();

module.exports = {
  mode: process.env.NODE_ENV || 'development',
  entry: './src/renderer/index.tsx',
  target: 'electron-renderer',
  output: {
    path: path.resolve(__dirname, 'dist/renderer'),
    filename: 'renderer.js',
    clean: true,
    // Configure proper public path for workers
    publicPath: './',
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx'],
    alias: {
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@renderer': path.resolve(__dirname, 'src/renderer'),
      '@components': path.resolve(__dirname, 'src/renderer/components'),
    },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.renderer.json',
            transpileOnly: true,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/renderer/index.html',
      filename: 'index.html',
    }),
    new MonacoWebpackPlugin({
      // Include comprehensive language support
      languages: [
        'typescript', 'javascript', 'html', 'css', 'scss', 'less', 
        'json', 'xml', 'markdown', 'yaml', 'python', 'java', 
        'csharp', 'cpp', 'c', 'php', 'ruby', 'go', 'rust', 
        'swift', 'kotlin', 'scala', 'r', 'sql', 'shell', 
        'powershell', 'dockerfile', 'plaintext'
      ],
      // Configure features
      features: [
        'accessibilityHelp',
        'anchorSelect',
        'bracketMatching',
        'caretOperations',
        'clipboard',
        'codeAction',
        'codelens',
        'colorPicker',
        'comment',
        'contextmenu',
        'coreCommands',
        'cursorUndo',
        'dnd',
        'documentSymbols',
        'find',
        'folding',
        'fontZoom',
        'format',
        'gotoError',
        'gotoLine',
        'gotoSymbol',
        'hover',
        'iPadShowKeyboard',
        'inPlaceReplace',
        'indentation',
        'inlineHints',
        'inspectTokens',
        'linesOperations',
        'linkedEditing',
        'links',
        'multicursor',
        'parameterHints',
        'quickCommand',
        'quickHelp',
        'quickOutline',
        'referenceSearch',
        'rename',
        'smartSelect',
        'snippets',
        'suggest',
        'toggleHighContrast',
        'toggleTabFocusMode',
        'transpose',
        'unusualLineTerminators',
        'viewportSemanticTokens',
        'wordHighlighter',
        'wordOperations',
        'wordPartOperations'
      ]
    }),
    new (require('webpack').DefinePlugin)({
      global: 'globalThis',
      __BUILD_METADATA__: JSON.stringify({ hash: GIT_HASH, time: BUILD_TIME }),
    }),
  ],
  devServer: {
    port: 3000,
    static: {
      directory: path.join(__dirname, 'dist/renderer'),
    },
    historyApiFallback: true,
    hot: true,
  },
};
