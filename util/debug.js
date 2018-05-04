/**
 * debug 模块：
 * <https://www.npmjs.com/package/debug>
 * A tiny JavaScript debugging utility modelled after Node.js core's debugging technique. Works in Node.js and web browsers.
 */
const debug = require('debug');

module.exports = function(namespace) {
  const error = debug(namespace);
  const info = debug(namespace);
  info.log = console.log.bind(console);//A function

  return {
    info,
    error
  };//QUEST:这个info和error有何区别么？
}
