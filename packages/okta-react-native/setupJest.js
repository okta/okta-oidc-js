// Required to correctly polyfill React-Native
global.XMLHttpRequest = global.XMLHttpRequest || function() {};
global.fetch = jest.fn();
