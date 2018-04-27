const debug = require('../util/debug')('user:profile');
const Router = require('koa-router');
const request = require('superagent');
const Joi = require('joi');
const schema = require('./schema');
const render = require('../util/render');

const router = new Router();

router.get('/profile', async (ctx, next) => {
  const userId = ctx.session.user.sub;
  debug.info("User id: %s", userId);

  if (!userId) {
    throw new Error('No user id found');
  }

  try {
    const resp = await request.get(`http://localhost:8100/staff/profile/${userId}`);

    // This overrides those set in check-login.
    ctx.state.user = resp.body;
  
    ctx.body = await render('settings/profile.html', ctx.state);
  } catch (e) {
    ctx.body = e.response.body;
  }
});

// Show change password page
router.get('/password', async (ctx, next) => {
  ctx.body = await render('settings/password.html', ctx.state);
});

// Accept new password
router.post('/password', async (ctx, next) => {

});


// Show bind myft page
router.get('/myft', async (ctx, next) => {
  const userId = ctx.session.user.sub;
  debug.info("User id: %s", userId);

  if (!userId) {
    throw new Error('No user id found');
  }

  try {
    debug.info('Requesting profile for user: %s', userId);
    
    const resp = await request.get(`http://localhost:8100/staff/profile/${userId}`);

    // This overrides those set in check-login.
    ctx.state.user = resp.body;
  
    ctx.body = await render('settings/myft.html', ctx.state);
  } catch (e) {
    if (e.response) {
      return ctx.body = e.response.body;
    }
    
    throw e;
  }
});

// Validatoe myft account and bind to cms account
router.post('/myft', async (ctx, next) => {
  const userId = ctx.session.user.sub;
  if (!userId) {
    throw new Error('No user id found');
  }

  const currentEmail = ctx.request.body.currentEmail;
  let credentials = ctx.request.body.credentials;

  try {
    debug.info("Validate: %O", credentials);
    credentials = await Joi.validate(credentials, schema.ftcAuth);
  } catch (e) {
    ctx.body = e;
  }

  if (currentEmail === credentials.email) {
    return ctx.redirect(ctx.path);
  }

  try {
    const resp = await request.post(`http://localhost:8100/staff/myft/${userId}`).send(credentials);

    ctx.redirect(ctx.path);

  } catch (e) {
    // error could be 404 if the email + password does not exist
    // 422 if the account is taken by others
    if (e.response) {
      throw e;
    }

    ctx.body = e.response.body;
  }
});

router.get('/myft/vip', async (ctx, enxt) => {
  const userId = ctx.session.user.sub;
  if (!userId) {
    throw new Error('No user id found');
  }

  try {
    const resp = await request.put(`http://localhost:8100/staff/vip/apply/${userId}`);
  } catch (e) {
    if (!e.response) {
      throw e;
    }

    return ctx.body = e.response.body;
  }
  

  ctx.redirect('/settings/myft');
});

module.exports = router.routes();