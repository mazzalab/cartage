const path = require('path');
const HWP = require('html-webpack-plugin');

module.exports = {
    entry: './src/datastore.js',
    output: {
        filename: 'build.js',
        path: path.resolve(__dirname, './static/js')
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
            { template: path.resolve(__dirname, './templates/labstore.html'), inject: false }
        )
    ],
    devtool: 'cheap-module-eval-source-map',
    devServer: {
        contentBase: path.join(__dirname, 'templates'),
        // hot: true
    }
}