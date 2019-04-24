const fs = require('fs')
const path = require('path')
const OptimizeCss = require('optimize-css-assets-webpack-plugin') // 压缩css
const MiniCssExtractPlugin = require('mini-css-extract-plugin') // extracts CSS into separate files
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const pages = require('./webpack-config/entry.config.js')
const rimraf = require('rimraf')
const watch = require('watch')

rimraf('./dist', fs, function cb() {
  console.log('dist目录已清空')
})

function createTemplate(content, main = './src/_main.ejs') {
  let strContent = fs.readFileSync( './'+ content, 'utf-8')
  let strMain = fs.readFileSync(main, 'utf-8')
  let template = content.split('\\')[content.split('\\').length - 1].split('.')[0];
  strMain = strMain.replace(/<%= htmlWebpackPlugin.options.content %>/, strContent)
  fs.writeFileSync(path.join(__dirname, `./src/template/template_${template}.ejs`), strMain)
  return path.join(__dirname, `./src/template/template_${template}.ejs`)
}

watch.watchTree('./src/project', function (f, curr, prev) {
  if (typeof f == "object" && prev === null && curr === null) {
    // Finished walking the tree
  } else if (prev === null) {
    // f is a new file
    createTemplate(f);
  } else if (curr.nlink === 0) {
    // f was removed
  } else {
    console.log('f', f)
    // f was changed
    createTemplate(f);
  }
})

module.exports = {
  devServer: {
    port: 3000,
    progress: true,
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    hot: true
  },

  // watch: true,
  // watchOptions: {
  //   aggregateTimeout: 500,
  //   ignored: /node_modules/
  // },

  optimization: { // 优化项
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCss()
    ]
  },

  mode: 'production', // production、development

  entry: pages.entry,

  output: {
    filename: '[name].js',
    path: path.join(__dirname, 'dist'),
    // publicPath: '//ajs.lotpure.cn'
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  plugins: require('./webpack-config/plugins.config.js'),

  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env'
            ]
          }
        }
      },
      {
        test: /\.ejs$/,
        loader: 'ejs-loader'
      },
      /**
       * postcss-loader 自动给样式增加前缀
       * css-loader 解析 @import 语法
       * style-loader 把css插入的head的标签中
       */
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader, 
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'sass-loader'
        ]
      }
    ]
  }
}