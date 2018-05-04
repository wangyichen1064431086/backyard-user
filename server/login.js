/**
 * Loggin with user's signup email on FTC site.
 */
const Router = require('koa-router');
const debug = require('../util/debug')('user:login');
const Joi = require('joi');//node模块：JavaScript对象验证器
const request = require('superagent');//一个小型的渐进式客户端HTTP请求库，该模块具有和nodejs原生相同的API
const schema = require('./schema');//schema.js文件写好了基于Joi的一系列对象验证schema
const render = require('../util/render');

const router = new Router();

router.get('/', async function (ctx) {
  ctx.body = await render('login.html', ctx.state);//用ctx.state数据渲染login.html, 它即为'/'路由的response.body
});

router.post('/', async function (ctx, next) {//login.html的默认提交action就是'/', 这是处理该表格的提交中间件
  let returnTo = ctx.query.return_to;//NOTE: ctx.query:同request.query,获取解析的查询字符串（即得到一个对象）,当没有查询字符串时，返回一个空字符。串。ctx.query.return_to是获取查询字符串中return_to的值。
  /**
   * @type {{name: string, password: string}} credentials
   */
  let credentials = ctx.request.body.credentials;//这是bodyparser可以这样解析input

  try {
    debug.info("Validate: %O", credentials);

    /**
     * @type {{name: string, password: string}} validated
     */
    credentials = await Joi.validate(credentials, schema.cmsAuth);//用cmsAuth模式来验证credentials数据
    /**
     * 该结果形如:
     { error: null,
        value: { username: 'abc', birthyear: 1994 },
        then: [Function: then],
        catch: [Function: catch] 
      }
     */

    debug.info("Validated credentials: %O", credentials);

    const resp = await request.post('http://localhost:8100/staff/auth')
      .send(credentials)//可以使用mutiple .send()调用
      .send({
        ip: ctx.ip
      });//resp就是response结果
      //QUEST:await能直接得到promise中resolve的结果吗？

    /**
     * @type {{id: number, name: string, displayName: string}}
     */
    const account = resp.body;
    debug.info('Authentication result: %o', account);

    // Keep login state
    ctx.session.user = {//设置cookie user
      //QUEST:cookie可以设置为对象?
      sub: account.id,
      name: account.name,
      display: account.displayName
    };

    ctx.redirect('/settings/profile');//同response.redirect(url):重定向到url

  } catch (e) {
    // Make the form stikcy.
    ctx.state.credentials = {
      name: credentials.name.trim() //设置ctx.state数据credentials
    };

    // Handle validation error
    const joiErrs = schema.gatherErrors(e);
    if (joiErrs) {
      debug.info('Joi validation errors: %O', joiErrs);
      ctx.state.errors = {
        credentials: "用户名或密码无效"
      };
      return await next();
    }

    if (404 == e.status) {
      // Unauthorized means password incorrect
      debug.info('Password incorrect');
      ctx.state.errors = {
        credentials: "用户名或密码无效"
      };
      return await next();
    }

    throw e;
  }
});

module.exports = router.routes();
