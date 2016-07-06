!function () {
  function $(selector) {
    return document.querySelector(selector);
  }
  function _(key, args) {
    var translate = window.ChatI18n && window.ChatI18n.translate;
    return translate && translate(key, args) || key;
  }
  function init() {
    var matches = location.pathname.match(/\/chat\/(.*)/);
    if (matches) {
      roomId = matches[1];
      title = _('Chat Room $1', [roomId]);
    } else title = _('Public Chat Room');
    document.title = title;
    connect();
  }
  function connect() {
    list = [];
    map = {};
    ws = new WebSocket('ws://' + location.host + '/chat.ws');
    ws.onopen = function (e) {
      command.disabled = false;
      submit.disabled = false;
      status.innerHTML = _('Reconnected, welcome back!');
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
        status.innerHTML = _('Connection lost, wait for reconnecting... $1', [count --]);
        setTimeout(wait, 1000);
      } else {
        status.innerHTML = _('Reconnecting...');
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
          html = _('Welcome back, $1!', [wrapNick(data.nick)]);
        else
          html = _('Welcome, $1!', [wrapNick(data.nick)]);
        break;
      case 'add':
        if (data.back)
          html = _('$1 just came back to the room.', [wrapNick(data.nick)]);
        else
          html = _('$1 just joined the room.', [wrapNick(data.nick)]);
        break;
      case 'leave':
        html = _('$1 just left the room.', [wrapNick(data.nick)]);
        break;
      case 'change':
        if (data.key == 'nick')
          html = _('$1 changed nickname to $2 .', [wrapNick(data.from), wrapNick(data.to)]);
        break;
      case 'listall':
        if (list.length)
          html = _('There are $1 people in this room: $2 and me.', [
            list.length + 1,
            list.map(function (member) {
              return wrapNick(member.nick);
            }).join(_(', ')),
          ]);
        else
          html = _('There is just me, lonely me.');
        break;
      case 'message':
        if (!data.id) {
          // System message
          html = '<div class="system">' + data.message + '</div>';
        } else {
          if (me && data.id === me.id)
            member = '<span class="nick me">' + _('I') + '</span>';
          else
            member = wrapNick(map[data.id].nick);
          html = member + _(' said: ') + safeHtml(data.message);
        }
        break;
      case 'disconnect':
        html = _('Connection lost...');
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

  var ws, title, list, map, roomId;
  var me = {};
  var status = $('.status');
  var contents = $('.contents');
  var commands = $('.commands');
  var command = $('#command');
  var submit = $('#submit');

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

  init();
}();
