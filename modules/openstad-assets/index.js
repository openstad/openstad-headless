const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  improve: 'apostrophe-assets'
  /* webpack: {
    // Options can be a function to merge and return new options
    extensions: {
      less: {
        module: {
          rules: [
            {
              test: /\.less$/i,
              use: [
                // compiles Less to CSS
                'style-loader',
                'css-loader',
                'less-loader'
              ]
            }
          ]
        }
      }
    }
  } */
};

/* construct: function(self, options) {

  } */

//
/*

 extensions: {
      vue2: {
        module: {
          rules: [
            {
              test: /\.vue$/,
              loader: 'vue-loader',
              options: {
                sourceMap: true
              }
            }
          ]
        },
        plugins: [
          // make sure to include the plugin for the magic
          new VueLoaderPlugin()
        ]
      }
    }

// Extension can be a function and return the final config
      addAlias(options) {
        console.log('aaaaa', options);

        return {
          mode: options.mode,
          resolve: {
            alias: options.alias || {}
          }
        };
      },
      addModule(options) {
        console.log('addModuleaddModuleaddModule', options);

        return {
          module: {
            rules: [
              {
                test: /\.less$/i,
                use: [
                // compiles Less to CSS
                  'style-loader',
                  'css-loader',
                  'less-loader'
                ]
              }
            ]
          }
        };
      }
      */
