// Karma configuration file
//
// If Chrome/Chromium isn't on your PATH in the standard location, set
// CHROME_BIN before running tests, e.g.:
//   CHROME_BIN=$(which chromium) npm test
if (!process.env.CHROME_BIN) {
  try {
    // Falls back to Puppeteer's bundled Chromium if it's installed as a dependency.
    process.env.CHROME_BIN = require('puppeteer').executablePath();
  } catch {
    // Neither CHROME_BIN nor puppeteer is available — karma-chrome-launcher
    // will fall back to auto-detecting a system Chrome/Chromium install.
  }
}

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage'),
      require('@angular-devkit/build-angular/plugins/karma'),
    ],
    client: {
      jasmine: {},
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, './coverage/devboard'),
      subdir: '.',
      reporters: [{ type: 'html' }, { type: 'text-summary' }],
    },
    reporters: ['progress', 'kjhtml'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
      },
    },
    browsers: ['ChromeHeadlessNoSandbox'],
    singleRun: false,
    restartOnFileChange: true,
  });
};
