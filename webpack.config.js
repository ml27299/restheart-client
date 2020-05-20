const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = [
    {
        entry: "./src/index.js",
        target: "node",
        optimization: {
            minimize: true
        },
        externals: [nodeExternals()],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader'
                        }
                    ]
                }
            ]
        },
        output: {
            path: path.resolve('dist'),
            filename: 'index.js',
            libraryTarget: 'commonjs2',
            sourceMapFilename: '[file].map'
        }
    }
];