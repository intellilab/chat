!function () {
  var ws, title, list, map, roomId;
  var me = {};
  var status = document.querySelector('.status');
  var contents = document.querySelector('.contents');
  var commands = document.querySelector('.commands');
  var command = document.querySelector('#command');
  var submit = document.querySelector('#submit');

  function connect() {
    list = [];
    map = {};
    ws = new WebSocket('ws://' + location.host + '/chat.ws');
    ws.onopen = function (e) {
      command.disabled = false;
      submit.disabled = false;
      status.innerHTML = '连接成功，欢迎回来！';
      setTimeout(function () {
        status.style.display = '';
      }, 2000);
    };
    ws.onmessage = function (event) {
      var message = JSON.parse(event.data);
      var handler = {
        update: update,
        remove: remove,
        listall: listall,
        message: chat,
        init: initConn,
      }[message.type];
      if (handler) handler(message.data);
    };
    ws.onclose = function (e) {
      if (me.connected) {
        me.connected = false;
        showMessage('disconnect');
      }
      retry();
    };
  }
  function retry() {
    ws = null;
    command.disabled = true;
    submit.disabled = true;
    status.style.display = 'block';
    function wait() {
      if (count) {
        status.innerHTML = '连接断开，准备重连... ' + (count --);
        setTimeout(wait, 1000);
      } else {
        status.innerHTML = '正在重连...';
        connect();
      }
    }
    var count = 10;
    wait();
  }
  function sendData(data) {
    ws.send(JSON.stringify(data));
  }

  function extend(dict1, dict2) {
    for (var key in dict2)
      dict1[key] = dict2[key];
    return dict1;
  }
  function safeHtml(html) {
    return html.replace(/[&<]/g, function (c) {
      return {
        '&': '&amp;',
        '<': '&lt;',
      }[c];
    });
  }
  function wrapNick(nick) {
    return '<span class="nick">' + safeHtml(nick) + '</span>';
  }

  function showMessage(type, data) {
    var html, member;
    switch (type) {
      case 'welcome':
        if (data.back)
          html = '欢迎回来，' + wrapNick(data.nick) + '！';
        else
          html = '欢迎你，' + wrapNick(data.nick) + '！';
        break;
      case 'add':
        if (data.back)
          html = wrapNick(data.nick) + '刚刚回到了聊天室。';
        else
          html = wrapNick(data.nick) + '刚刚加入了聊天。';
        break;
      case 'leave':
        html = wrapNick(data.nick) + '刚刚离开了聊天。';
        break;
      case 'change':
        if (data.key == 'nick')
          html = wrapNick(data.from) + '把昵称改成了' + wrapNick(data.to) + '。';
        break;
      case 'listall':
        if (list.length)
          html = '目前有' + (list.length + 1) + '个人参与了聊天，分别是' +
            list.map(function (member) {
              return wrapNick(member.nick);
            }).join('、') + '和我。';
        else
          html = '目前只有我一个人孤零零地在这里。';
        break;
      case 'message':
        if (!data.id) {
          // 系统消息
          html = '<div class="system">' + data.message + '</div>';
        } else {
          if (me && data.id === me.id)
            member = '<span class="nick me">我</span>';
          else
            member = wrapNick(map[data.id].nick);
          html = member + '说：' + safeHtml(data.message);
        }
        break;
      case 'disconnect':
        html = '连接已断开...';
        break;
    }
    var msg = document.createElement('div');
    msg.className = 'message';
    msg.innerHTML = html;
    contents.appendChild(msg);
    msg.scrollIntoView(true);
    //if (contents.scrollHeight > contents.offsetHeight)
      //contents.scrollTop = contents.scrollHeight - contents.offsetHeight;
  }

  function initConn(data) {
    me.id = data.id;
    var postData = {};
    if (roomId) postData.room = roomId;
    if (me.nick) {
      postData.nick = me.nick;
      postData.back = true;
    }
    sendData({
      type: 'init',
      data: postData,
    });
    sendData({
      type: 'listall',
    });
  }

  function update(data) {
    var member = map[data.id];
    if (!member) {
      map[data.id] = data;
      if (me.id == data.id) {
        me.nick = data.nick;
        document.title = me.nick + '@' + title;
        showMessage('welcome', {
          nick: me.nick,
          back: data.back,
        });
      } else {
        list.push(data);
        showMessage('add', {
          nick: data.nick,
          back: data.back,
        });
      }
    } else {
      if (member.nick != data.nick) {
        showMessage('change', {
          key: 'nick',
          from: member.nick,
          to: data.nick,
        });
        member.nick = data.nick;
        if (member.id === me.id)
          document.title = me.nick + '@' + title;
      }
    }
    me.connected = true;
  }

  function remove(id) {
    var member = map[id];
    if (member) {
      delete map[id];
      var i = list.indexOf(member);
      if (i >= 0) list.splice(i, 1);
      showMessage('leave', {
        nick: member.nick
      });
    }
  }

  function listall(data) {
    list = [];
    map = {};
    data.forEach(function (member) {
      if (member.id != me.id)
        list.push(member);
      map[member.id] = member;
    });
    showMessage('listall');
  }

  function chat(data) {
    showMessage('message', {
      id: data.id,
      message: data.message,
    });
  }

  commands.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = command.value;
    if (/^\s*$/.test(text)) return;
    var cmd = text.match(/^\/(\w+)( .*|)$/);
    var data;
    if (cmd) {
      var cmdData = cmd[2].trim();
      switch (cmd[1]) {
        case 'nick':
          data = {
            type: 'nick',
            data: {
              nick: cmdData,
            }
          };
          break;
        case 'listall':
          data = {
            type: 'listall',
          };
          break;
      }
    }
    if (!data) data = {
      type: 'message',
      data: text
    };
    sendData(data);
    command.value = '';
  }, false);

  function init() {
    var matches = location.pathname.match(/\/chat\/(.*)/);
    if (matches) {
      roomId = matches[1];
      title = '聊天室' + roomId;
    } else title = '公共聊天室';
    document.title = title;
    connect();
  }

  init();
}();
