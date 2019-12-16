const path = require('path');
const HWP = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    // entry: path.join(__dirname, '/src/index.js'),
    entry: './src/index.js',
    output: {
        filename: 'build.js',
        //path: path.join(__dirname, '/dist')
        path: path.resolve(__dirname, './dist'),
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', "@babel/preset-react"]
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx']
    },
    plugins: [
        new HWP(
            { template: path.resolve(__dirname, './templates/index.html') }
        ),
        new webpack.HotModuleReplacementPlugin()
    ],
    devServer: {
        contentBase: './dist',
        hot: true
    }
}