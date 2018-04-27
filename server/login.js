/**
 * Loggin with user's signup email on FTC site.
 */
const Router = require('koa-router');
const debug = require('../util/debug')('user:login');
const Joi = require('joi');
const request = require('superagent');
const schema = require('./schema');
const render = require('../util/render');

const router = new Router();

router.get('/', async function (ctx) {
  ctx.body = await render('login.html', ctx.state);
});

router.post('/', async function (ctx, next) {
  let returnTo = ctx.query.return_to;
  /**
   * @type {{name: string, password: string}} credentials
   */
  let credentials = ctx.request.body.credentials;

  try {
    debug.info("Validate: %O", credentials);

    /**
     * @type {{name: string, password: string}} validated
     */
    credentials = await Joi.validate(credentials, schema.cmsAuth);

    debug.info("Validated credentials: %O", credentials);

    const resp = await request.post('http://localhost:8100/staff/auth')
      .send(credentials)
      .send({
        ip: ctx.ip
      });

    /**
     * @type {{id: number, name: string, displayName: string}}
     */
    const account = resp.body;
    debug.info('Authentication result: %o', account);

    // Keep login state
    ctx.session.user = {
      sub: account.id,
      name: account.name,
      display: account.displayName
    };

    ctx.redirect('/settings/profile');

  } catch (e) {
    // Make the form stikcy.
    ctx.state.credentials = {
      name: credentials.name.trim()
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
