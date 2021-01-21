// Protractor configuration file, see link for more information
// https://github.com/ganeshsirsi/ProtractorEndToEndTest

const { SpecReporter } = require('jasmine-spec-reporter');
var date = new Date();
var resultsFolderName = date.getUTCDate() + "-" + (date.getUTCMonth() + 1) + "-" + date.getUTCFullYear() + "-" + date.getUTCHours();
var screenShotsFolder = process.cwd() + '/testResults/' + resultsFolderName + '/screenshots/';
var testResultsPath = process.cwd() + '/testResults/' + resultsFolderName + '/';

exports.config = {
  allScriptsTimeout: 60000,
  baseUrl: 'https://www.google.com',
 seleniumAddress: 'http://localhost:4444/wd/hub/',
  specs: [
    './src/**/*.e2e-spec.ts'
  ],

  //localSeleniumStandaloneOpts: {
  //  jvmArgs: [
  //    '-Dwebdriver.ie.driver=C:\Program Files\nodejs\node_modules\webdriver-manager\selenium\IEDriverServer3.14.0'
  //  ]
  //},
  capabilities: {
    'browserName': 'chrome',
    'platform': 'ANY',
    'version': '88'
    //'ignoreProtectedModeSettings': true,
    //chromeOptions: {
    //  args: ["--headless", "--disable-gpu", "--window-size=1280x1024"]
    //},

  },

  // multiCapabilities: [{
  //  'browserName': 'chrome',
  //  // chromeOptions: {
  //  // // args: ["--headless", "--disable-gpu", "--window-size=1280x1024"]
  // },
  // {
  //  'browserName': 'internet explorer',
  //  'ignoreProtectedModeSettings': true,
  //  'nativeEvents': false,
  //  'ignoreZoomSetting': true,
  //  'unexpectedAlertBehaviour': 'accept',
  //  'enablePersistentHover': true,
  //  'disable-popup-blocking': true
  // }],	 

  directConnect: true,
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 60000,
    keepAlive: true,
    print: function () { }
  },
  onPrepare() {
    require('ts-node').register({
      project: require('path').join(__dirname, './tsconfig.e2e.json')
    });
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: testResultsPath,
      filePrefix: 'xmlresults'
    }));


    // create screenshots for failed tests
    var fs = require('fs-extra');

    fs.emptyDir(screenShotsFolder, function (err) {
      console.log(err);
    });
    jasmine.getEnv().addReporter({
      specDone: function (result) {
        if (result.status === 'failed') {
          browser.getCapabilities().then(function (caps) {
            var browserName = caps.get('browserName');

            browser.takeScreenshot().then(function (png) {
              var stream = fs.createWriteStream(screenShotsFolder + browserName + '-' + result.fullName + '.png');
              stream.write(new Buffer(png, 'base64'));
              stream.end();
            });
          });
        }
      }
    });


  },
  //HTMLReport called once tests are finished
  onComplete: function () {
    var browserName, browserVersion;
    var capsPromise = browser.getCapabilities();

    capsPromise.then(function (caps) {
      browserName = caps.get('browserName');
      browserVersion = caps.get('version');

      var HTMLReport = require('protractor-html-reporter');

      testConfig = {
        reportTitle: 'Ganesh Hegde Report ' + browser.baseUrl,
        outputPath: testResultsPath,
        screenshotPath: screenShotsFolder,
        testBrowser: browserName,
        browserVersion: browserVersion,
        modifiedSuiteName: false,
        screenshotsOnlyOnFailure: true
      };
      new HTMLReport().from(testResultsPath + 'xmlresults.xml', testConfig);
    });
  }
};
