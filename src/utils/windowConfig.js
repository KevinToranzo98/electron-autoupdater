const path = require('path');

const windowConfig = {
  icon: path.join(__dirname, '..', 'assets', 'images', 'splash.ico'),
  frame: false,
  show: false,
  transparent: true,
  resizable: false,
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
  },
};

module.exports = { windowConfig };
