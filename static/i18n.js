var ChatI18n = function (data) {
  function translate(key, args) {
    for (var i = 0; i < langs.length; i ++) {
      var lang = langs[i];
      var group = data[lang];
      var value = group && group[key];
      if (value) break;
    }
    value = value || key;
    return value.replace(/\$(\w+)|\$\{(\w+)\}/g, function (m, g1, g2) {
      return args && args[+(g1 || g2) - 1] || '';
    });
  }
  var langs = navigator.languages || [navigator.language];
  langs = langs.reduce(function (res, lang) {
    res.data = res.data.concat(lang.split('-').reduce(function (data, part) {
      var item = data[0];
      item = item ? item + '-' + part : part;
      if (!res.uni[item]) {
        res.uni[item] = 1;
        data.unshift(item);
      }
      return data;
    }, []));
    return res;
  }, {data: [], uni: {}}).data
  .filter(function (lang) {
    return data[lang];
  });
  return {
    translate: translate,
  };
}({
  zh: {
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
    'I': '我',
    ' said: ': '说：',
    'Connection lost...': '连接已断开...',
  },
});
