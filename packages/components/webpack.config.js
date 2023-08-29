const webpack = require('webpack');
const path = require("path");
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {

	mode: 'production',

	entry: {

    'all': {
      import: './src/index.jsx',
      filename: 'index.js',
      library: {
        name: 'OS20',
        type: 'assign-properties',
      },
    },

    'button': {
      import: './src/button/index.jsx',
      filename: 'button.js',
      library: {
        name: 'OS20',
        type: 'assign-properties',
      },
    },

    'comments': {
      import: './src/comments/index.jsx',
      filename: 'comments.js',
      library: {
        name: 'OS20',
        type: 'assign-properties',
      },
    },

    'hello': {
      import: './src/Hello.jsx',
      filename: 'hello.js',
      library: {
        name: 'OS20',
        type: 'assign-properties',
      },
    },

    'goodbye': {
      import: './src/Goodbye.jsx',
      filename: 'goodbye.js',
      library: {
        name: 'OS20',
        type: 'assign-properties',
      },
    },
    
    'user': './src/user/index.jsx',

  },

	output: {
    devtoolNamespace: 'mycomponents',
		path: path.resolve(__dirname + '/dist'),
		filename: '[name].js',
    library: ['OpenStad', '[name]'],
    libraryTarget: 'window',
	},

	externals: {
    'react': 'React',
    'react-dom': 'ReactDOM',
	},

  devtool: false,

  plugins: [
		new webpack.SourceMapDevToolPlugin({
			 filename: '[file].map',
		}),
		new MiniCssExtractPlugin({
			filename: 'css/[name].css',
			ignoreOrder: false,
		}),
//    new webpack.ProvidePlugin({
//      Promise: 'es6-promise-promise',
//    }),
  ],

	optimization: {
		minimize: true,
		minimizer: [new TerserPlugin()],
	},

  resolve: {
    extensions: [".*", ".js", ".jsx", ".css", ".less"],
  },

  module: {
    rules: [

      // js and react
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: ["babel-loader"],
      },

			{
				test: /\.less$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader,
						options: {
//							hmr: process.env.NODE_ENV === 'development',
						},
					},
					'css-loader',
					'less-loader',
				],
			},
 
			{
				test: /\.css$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader, 
						options: {
							publicPath: '../'
						}
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									[
										'postcss-preset-env',
										{
											// Options
										},
									],
								],
							},
						},
					},
				]
			},
 
			{ // other images
				test: /\.(png|jpe?g|gif|svg)$/i,
        type: 'asset/resource',
       generator: {
         filename: 'images/[name].[ext]'

       },
			},

    ],
  },

};
