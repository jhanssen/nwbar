/*global module*/

// yay for nw.js, this has been broken for years

'use strict';
module.exports = function consoleHack (newConsole) {
  console = newConsole;
};
