const debug = require('./util/debug')('user:index');//该debug function直接传入了'user:index'作为参数namespace

const path = require('path');
const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');//development style logger
const bodyParser = require('koa-bodyparser');//用于解析body的koa中间件
const session = require('koa-session');//Koa的简单会话中间件。默认为基于cookie的会话并支持外部存储。

const checkLogin = require('./middlewares/check-login');//作者自己写的登录中间件

const login = require('./server/login');//用于'/login'路由的中间件
const logout = require('./server/logout');//用于'/logout'路由的中间件
const settings = require('./server/settings');//用于'/settings'路由的中间件
const admin = require('./server/admin');//用于'/admin'路由的中间件

const app = new Koa();//创建Koa应用程序实例
const router = new Router();//创建router实例

app.proxy = true;//NOTE: app.proxy：应用程序设置，即设置app实例上的属性，此处是设置proxy为true,即表示真正的代理头字段将被信任
//QUEST:还是不太理解这个app.proxy属性的意义，什么叫做真正的代理头字段将被信任？？

app.keys = ['SEKRIT1', 'SEKRIT2'];//NOTE:app.keys= 设置签名的Cookie秘钥，在使用 { signed: true } 参数签名 Cookie 时使用
//QUEST:还是不太理解这个app.keys是怎么作用的。。。

app.use(logger());

if (process.env.NODE_ENV !== 'production') {//如果是开发环境,那么serve的静态资源存放于node_modules和client
  const static = require('koa-static');
  app.use(static(path.resolve(process.cwd(), 'node_modules')));
  app.use(static(path.resolve(process.cwd(), 'client')));
}

app.use(async function (ctx, next) {
  /**
   * 该中间件就是起到设置有用的信息(通过ctx.state设置)的作用
   */
  ctx.state.env = {//NOTE:ctx.state:推荐的命名空间，用于通过中间件传递信息并到达你的前端视图。
    isProduction: process.env.NODE_ENV === 'production',
    year: new Date().getFullYear()
  };
  debug.info(ctx.state.env);
  debug.info('Origin: %s', ctx.origin);//ctx.origin: 同request.origin:获取URL的来源，包括 protocol 和 host。

  debug.info('Host: %s', ctx.host);//ctx.host:同request.host:获取当前主机
  debug.info('Hostname: %s', ctx.hostname);//ctx.hostname:同request.hostname:存在时获取主机名
  
  await next();
});

app.use(session(app));//通过该中间件，ctx获得了属性ctx.session，其上面会有cookie的信息
app.use(bodyParser());//用于解析body的koa中间件

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
