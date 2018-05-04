const debug = require('debug')('login:server');
const Router = require('koa-router');

const router = new Router();

router.get('/', async (ctx, next) => {
  ctx.session = null;//cookie清零，直接这样清吗？为啥不只清ctx.session.user。。
  ctx.redirect('login');
  return;
});

module.exports = router.routes();