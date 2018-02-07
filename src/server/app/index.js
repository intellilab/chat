import Koa from 'koa';
import BodyParser from 'koa-bodyparser';
import nconf from '../config';
import { getLogger } from '../utils/helpers';
import routeStatic from '../routes/static';
import initSocket from './socket';
import { getRoom, getMember } from './room';

const logger = getLogger('server');
const IS_PROD = nconf.get('NODE_ENV') === 'production';

const app = new Koa();
app.keys = [nconf.get('SECRET_KEY')];

if (!IS_PROD) {
  app.use(async (ctx, next) => {
    await next();
    logger.info(`${ctx.method} ${ctx.url} ${ctx.status}`);
  });
}

app
.use(BodyParser({ enableTypes: ['json'] }))
.use(routeStatic);

initSocket(app);

app.io.route('disconnect', client => {
  const member = getMember(client);
  if (member) {
    member.remove();
    member.room.broadcast('remove', { id: member.id });
  }
});

app.io.route('init', (client, { nick, back, roomId }) => {
  const room = getRoom(roomId);
  const member = room.addMember(client);
  if (!member) return;
  if (nick) member.update({ nick });
  client.emit('init', { id: member.id });
  member.room.broadcast('update', {
    back,
    ...member.info(),
  });
  logger.info('init [%s] %s %s', member.id, member.nick, back ? 'back' : '');
});

app.io.route('listAll', client => {
  logger.info('listAll');
  const member = getMember(client);
  client.emit('listAll', member.room.listAll());
});

app.io.route('nick', (client, nick) => {
  const member = getMember(client);
  member.update({ nick });
  member.room.broadcast('update', member.info());
});

app.io.route('message', (client, content) => {
  logger.info('message', content);
  const member = getMember(client);
  member.room.broadcast('message', {
    id: member.id,
    content,
  });
});

app.listen(nconf.get('PORT'), nconf.get('HOST'), err => {
  if (err) throw err;
  logger.info(`Listening at port ${nconf.get('PORT')}...`);
});
