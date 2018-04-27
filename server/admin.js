const debug = require('../util/debug')('user:profile');
const Router = require('koa-router');
const request = require('superagent');
const render = require('../util/render');
const random = require('../util/random');

const router = new Router();

// Display all users
router.get('/users', async (ctx, next) => {
  try {
    const resp = await request.get('http://localhost:8100/staff/roster');

    ctx.state.users = resp.body;

    ctx.body = await render('admin/users.html', ctx.state);
  } catch (e) {
    if (e.response) {
      return ctx.body = e.response.body;
    }
    throw e;
  }
});

// Create a new user
router.get('/users/new', async (ctx, next) => {
  ctx.body = await render('admin/new-user.html', ctx.state);
});

router.post('/users/new', async (ctx, next) => {
  const user = ctx.request.body.user;
  user.password = await random.hex(5);
  ctx.body = user;
  // try {

  // } catch (e) {

  // }
  // ctx.redirect('/admin/users/profile/')
});

// Delete a user
router.post('/users/delete/:id', async (ctx, next) => {

  ctx.redirect('/admin/users');
});

// Show a user
router.get('/users/profile/:id', async (ctx, next) => {
  const userId = ctx.params.id;

  try {
    const resp = await request.get(`http://localhost:8100/staff/profile/${userId}`);

    ctx.state.user = resp.body;

    ctx.body = await render('admin/profile.html', ctx.state);
  } catch (e) {
    if (e.response) {
      return ctx.body = e.response.body
    }

    throw e;
  }
});

// Update a user
router.post('/users/profile/:id', async (ctx, next) => {
  const user = ctx.request.body.user;

  ctx.body = ctx.request.body;
});

router.post('/users/reset-password/:id', async (ctx, next) => {
  const userId = ctx.params.id;
  const password = await random.hex(5);

  ctx.body = {userId, password};
});

// VIP
router.get('/vip', async (ctx, next) => {

});

router.put('/vip/grant/:id', async (ctx, next) => {

});

router.put('/vip/revoke/:id', async (ctx, next) => {

});

module.exports = router.routes();