import fs from 'fs';
import send from 'koa-send';
import nconf from '../config';

const optionsStatic = {
  root: 'dist/client',
};

if (nconf.get('NODE_ENV') === 'production') {
  fs.accessSync(optionsStatic.root);
}

export default async ctx => {
  let { path } = ctx;
  if (path === '/') path = '/index.html';
  if (await send(ctx, path, optionsStatic)) return;
  ctx.redirect('/');
};
