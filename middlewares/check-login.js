const {escape} = require('querystring');//querystring.escape(str):对给定的str进行URL编码
const debug = require('../util/debug')('user:check-login');//该debug function直接传入了'user:check-login'作为参数namespace

/**
 * @return {Async Function}
 */
function checkLogin() {
  return async (ctx, next) => {
    debug.info('Accessing URL: %s', ctx.href);
    //此处debug.info就是 require('debug')('user:check-login')的执行结果
    //%s表示string
    //ctx.href:等于request.href,获取完整的请求URL，包括 protocol，host 和 query。



    // Do nothing for `/favicon.ico`
    if (ctx.path == '/favicon.ico') return;

    if (isLoggedIn(ctx)) {//(根据cookie判断)如果已登录
      debug.info('ctx.session: %O', ctx.session);
      //debug formatter %O: Pretty-print an Object on multiple lines.

      ctx.state.userinfo = {
        displayName: ctx.session.user.display
      };//NOTE: ctx.state: Koa推荐的命名空间，用于通过中间件传递信息和你的前端视图。
      //QUEST:cookie值可以是object ？



      debug.info('ctx.state.userinfo: %O', ctx.state.userinfo);
      return await next();//NOTE:当一个中间件调用next()则该函数暂停并将控制传递给定义的下一个中间件。当下游没有更多的中间件执行后，恢复到这里接着执行上游行为。
    }

    ctx.state.user = null;//将cookie中的user置为null

    debug.info('User not logged in. Redirecting to /login');
    ctx.redirect(`/login?return_to=${escape(ctx.href)}`);
    /* 
     * NOTE:ctx.redirect(url, [alt]):
     * 同response.redirect(url, [alt]),执行302重定向到url
     * 参数url的值可以为'back'，是特别提供的参照支持，当其不存在时使用alt或'/'
    */
  }
}

function isLoggedIn(ctx) {
  if (ctx.session.isNew || !ctx.session.user) {
    //如果cookie中isNew为真 或 user没有值，那么就表示没有登录
    return false
  }

  return true;
}

module.exports = checkLogin;
