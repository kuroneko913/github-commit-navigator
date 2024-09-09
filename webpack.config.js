const path = require('path');

module.exports = {
  mode: 'production', // 本番環境用バンドルにする
  entry: './src/main.js', // メインのエントリーポイント
  output: {
    filename: 'bundle.js', // バンドルされたファイル名
    path: path.resolve(__dirname, 'dist'), // 出力先
  },
  module: {
    rules: [
      {
        test: /\.js$/, // JSファイルに対してBabelを適用
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
