var coveralls = false;
if (process.env.TRAVIS && /v6\./.test(process.version)) {
  coveralls = true;
}

var reporters = ['progress', 'coverage'];
if (coveralls) {
  reporters.push('coveralls');
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [
      'tests/*.ts'
    ],
    exclude: [],
    preprocessors: {
      'tests/*.ts': ['webpack']
    },
    reporters: reporters,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Firefox'],
    singleRun: false,
    concurrency: Infinity,
    browserNoActivityTimeout: 100000,
    coverageReporter: {
      type: coveralls ? 'lcov' : 'text',
      dir: 'coverage/'
    },
    webpack: {
      resolve: {
        extensions: ['', '.js', '.ts']
      },
      module: {
        loaders: [{
          test: /\/lib\/.*\.ts$/,
          loaders: ['istanbul-instrumenter', 'ts']
        }, {
          test: /\/tests\/.*\.ts$/,
          loaders: ['webpack-espower', 'ts']
        }, {
          test: /\.json$/,
          loader: 'json'
        }],
        noParse: [
          /\/acorn\.js$/
        ]
      },
      node: {
        fs: 'empty'
      }
    },
    webpackMiddleware: {
      noInfo: true,
      stats: 'minimal'
    }
  });
};
