const path = require('path');
const nunjucks = require('nunjucks');
const markdown = require('nunjucks-markdown');//A nunjuck extension that adds a markdown tag.
const marked = require('marked');
const util = require('util');
const env = nunjucks.configure(path.resolve(__dirname, '../views'), {
  noCache: true,
  watch: false
});//配置nunjucks渲染env

markdown.register(env, marked);

module.exports = util.promisify(nunjucks.render);//就是把nunjucks.render包装成了一个promise
