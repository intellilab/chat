const fs = require('fs');
const send = require('koa-send');
const nconf = require('../config');

const optionsStatic = {
  root: 'client/dist',
};

if (nconf.get('NODE_ENV') === 'production') {
  fs.accessSync(optionsStatic.root);
}

module.exports = async ctx => {
  let { path } = ctx;
  if (path === '/') path = '/index.html';
  if (await send(ctx, path, optionsStatic)) return;
  ctx.redirect('/');
};
