const debug = require('./util/debug')('user:index');
const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');

const checkLogin = require('./middlewares/check-login');

const login = require('./server/login');
const logout = require('./server/logout');
const settings = require('./server/settings');
const admin = require('./server/admin');

const app = new Koa();
const router = new Router();

app.proxy = true;
app.keys = ['SEKRIT1', 'SEKRIT2'];

app.use(logger());

if (process.env.NODE_ENV !== 'production') {
  const static = require('koa-static');
  app.use(static(path.resolve(process.cwd(), 'node_modules')));
  app.use(static(path.resolve(process.cwd(), 'client')));
}

app.use(async function (ctx, next) {
  ctx.state.env = {
    isProduction: process.env.NODE_ENV === 'production',
    year: new Date().getFullYear()
  };
  debug.info(ctx.state.env);
  debug.info('Origin: %s', ctx.origin);
  debug.info('Host: %s', ctx.host);
  debug.info('Hostname: %s', ctx.hostname);
  
  await next();
});

app.use(session(app));
app.use(bodyParser());

router.use('/login', login);
router.use('/logout', logout);
router.use('/settings', checkLogin(), settings);
router.use('/admin', checkLogin(), admin);

app.use(router.routes());

console.log(router.stack.map(layer => layer.path));

/**
 * @param {Koa} app - a Koa instance
 */
async function bootUp(app) {
  const appName = 'backyard-user';
  debug.info('booting %s', appName);

  const port = process.env.PORT || 3100;

  // Create HTTP server
  const server = app.listen(port);

  // Logging server error.
  server.on('error', (error) => {
    debug.error('Server error: %O', error);
  });

  // Listening event handler
  server.on('listening', () => {
    debug.info('%s running on %O', appName, server.address());
  });
}

bootUp(app)
  .catch(err => {
    debug.error('Bootup error: %O', err);
  });
