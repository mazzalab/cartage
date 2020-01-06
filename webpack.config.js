const path = require('path');
const HWP = require('html-webpack-plugin');

module.exports = {
    // entry: path.join(__dirname, '/src/index.js'),
    entry: './src/index.js',
    output: {
        filename: 'build.js',
        //path: path.join(__dirname, '/dist')
        path: path.resolve(__dirname, './templates')
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            }]
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
    },
    plugins: [
        new HWP(
            { template: path.resolve(__dirname, './templates/index.html'), inject: false }
        )
    ],
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'templates'),
        // hot: true
    }
}