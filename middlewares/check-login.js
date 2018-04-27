const {escape} = require('querystring')
const debug = require('../util/debug')('user:check-login');

/**
 * @return {Async Function}
 */
function checkLogin() {
  return async (ctx, next) => {
    debug.info('Accessing URL: %s', ctx.href);

    // Do nothing for `/favicon.ico`
    if (ctx.path == '/favicon.ico') return;

    if (isLoggedIn(ctx)) {
      debug.info('ctx.session: %O', ctx.session);

      ctx.state.userinfo = {
        displayName: ctx.session.user.display
      };

      debug.info('ctx.state.userinfo: %O', ctx.state.userinfo);
      return await next();
    }

    ctx.state.user = null;

    debug.info('User not logged in. Redirecting to /login');
    ctx.redirect(`/login?return_to=${escape(ctx.href)}`);
  }
}

function isLoggedIn(ctx) {
  if (ctx.session.isNew || !ctx.session.user) {
    return false
  }

  return true;
}

module.exports = checkLogin;
