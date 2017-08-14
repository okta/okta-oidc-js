exports.config = {
  framework: 'jasmine',
  directConnect: true,
  specs: ['specs/*.js'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: [
        '--headless',
        '--disable-gpu',
        '--window-size=800,600'
      ]
     }
  }
}
