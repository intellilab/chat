import _get from 'lodash.get';

const langs = (navigator.languages || [navigator.language])
.reduce((res, lang) => {
  res.push(lang);
  const parts = lang.split('-');
  if (parts.length > 1) res.push(parts[0]);
  return res;
}, []);
const localeValues = {};

export function register(lang, values) {
  localeValues[lang] = values;
}

export function translate(key, args) {
  const lang = langs.find(_lang => _get(localeValues, [_lang, key]));
  const value = lang && localeValues[lang][key] || key;
  return value.replace(
    /\$(\w+)|\$\{(\w+)\}/g,
    (m, g1, g2) => args && args[+(g1 || g2) - 1] || '',
  );
}

register('zh', {
  'Chatroom $1': '聊天室 $1',
  'Public Chat Room': '公共聊天室',
  'Reconnected, welcome back!': '连接成功，欢迎回来！',
  'Reconnecting...': '正在重连...',
  'Connection lost, wait for reconnecting... $1': '连接断开，准备重连... $1',
  'Welcome, $1!': '欢迎你，$1！',
  'Welcome back, $1!': '欢迎回来，$1！',
  '$1 just came back to the room.': '$1 刚刚回到了聊天室。',
  '$1 just joined the room.': '$1 刚刚加入了聊天。',
  '$1 just left the room.': '$1 刚刚离开了聊天。',
  '$1 changed nickname to $2 .': '$1 把昵称改成了 $2。',
  ', ': '、',
  'There are $1 people in this room: $2 and me.': '目前有 $1 个人参与了聊天，分别是 $2 和我。',
  'There is just me, lonely me.': '目前只有我一个人孤零零地在这里。',
  I: '我',
  ' said: ': '说：',
  'Connection lost...': '连接已断开...',
});
