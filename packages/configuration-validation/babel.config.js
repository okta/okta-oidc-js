const presets = ['@babel/preset-env'];
const plugins = [];

// Process typescript when running in jest
if (process.env.NODE_ENV === 'test') {
  presets.unshift('@babel/preset-typescript');
  plugins.unshift('@babel/plugin-transform-typescript');
}

module.exports = { presets, plugins };