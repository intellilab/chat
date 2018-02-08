<template>
  <div>
    <div class="fullscreen">
      <div class="contents">
        <div class="message" v-for="message in messages" :key="message.key" v-html="message.html"></div>
      </div>
      <form class="commands" @submit.prevent="onSubmit">
        <input type="text" autocomplete="off" v-model="content">
        <button type="submit">发送</button>
      </form>
    </div>
    <div class="status" v-show="false"></div>
    <a href="https://github.com/intellilab/chat"><img style="position: absolute; top: 0; right: 0; border: 0;" src="https://camo.githubusercontent.com/e7bbb0521b397edbd5fe43e7f760759336b5e05f/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f6769746875622f726962626f6e732f666f726b6d655f72696768745f677265656e5f3030373230302e706e67" alt="Fork me on GitHub" data-canonical-src="https://s3.amazonaws.com/github/ribbons/forkme_right_green_007200.png"></a>
  </div>
</template>

<script>
import io from 'socket.io-client';
import { translate } from './i18n';

const url = new URL('ws/', window.location);
const socket = io(window.location.origin, { path: url.pathname });

const store = {
  title: '',
  me: {},
  memberList: [],
  memberMap: {},
  messages: [],
  content: '',
};
store.roomId = window.location.search.slice(1);
if (store.roomId) {
  store.roomTitle = translate('Chatroom $1', [store.roomId]);
} else {
  store.roomTitle = translate('Public Chat Room');
  store.title = store.roomTitle;
}

function initialize() {
  const { nick } = store.me;
  socket.emit('init', {
    nick,
    back: !!nick,
    roomId: store.roomId,
  });
}

socket.on('connect', initialize);
socket.on('reconnect', initialize);

socket.on('init', ({ id }) => {
  store.me.id = id;
});

socket.on('update', ({ id, nick, back }) => {
  const { memberList, memberMap, me } = store;
  const member = memberMap[id];
  if (!member) {
    memberMap[id] = { id, nick };
    if (me.id === id) {
      me.nick = nick;
      store.title = `${nick}@${store.roomTitle}`;
      showMessage('welcome', { nick, back });
      socket.emit('listAll');
    } else {
      memberList.push({ id, nick });
      showMessage('add', { nick, back });
    }
  } else if (member.nick !== nick) {
    showMessage('change', {
      key: 'nick',
      from: member.nick,
      to: nick,
    });
    member.nick = nick;
    if (member.id === me.id) store.title = `${nick}@${store.roomTitle}`;
  }
  me.connected = true;
});

socket.on('remove', ({ id }) => {
  const { memberList, memberMap } = store;
  const member = memberMap[id];
  if (member) {
    delete memberMap[id];
    const i = memberList.indexOf(member);
    if (i >= 0) memberList.splice(i, 1);
    showMessage('leave', {
      nick: member.nick,
    });
  }
});

socket.on('listAll', list => {
  const memberList = [];
  const memberMap = {};
  list.forEach(member => {
    if (member.id !== store.me.id) memberList.push(member);
    memberMap[member.id] = member;
  });
  store.memberList = memberList;
  store.memberMap = memberMap;
  showMessage('listAll');
});

socket.on('message', ({ id, content }) => {
  showMessage('message', { id, content });
});

function safeHtml(html) {
  return html.replace(/[&<]/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
  }[c]));
}

function wrapNick(nick) {
  return `<span class="nick">${safeHtml(nick)}</span>`;
}

function showMessage(type, data) {
  let html;
  if (type === 'welcome') {
    if (data.back) {
      html = translate('Welcome back, $1!', [wrapNick(data.nick)]);
    } else {
      html = translate('Welcome, $1!', [wrapNick(data.nick)]);
    }
  } else if (type === 'add') {
    if (data.back) {
      html = translate('$1 just came back to the room.', [wrapNick(data.nick)]);
    } else {
      html = translate('$1 just joined the room.', [wrapNick(data.nick)]);
    }
  } else if (type === 'leave') {
    html = translate('$1 just left the room.', [wrapNick(data.nick)]);
  } else if (type === 'change') {
    if (data.key === 'nick') {
      html = translate('$1 changed nickname to $2 .', [wrapNick(data.from), wrapNick(data.to)]);
    }
  } else if (type === 'listAll') {
    const { memberList } = store;
    if (memberList.length) {
      html = translate('There are $1 people in this room: $2 and me.', [
        memberList.length + 1,
        memberList.map(member => wrapNick(member.nick)).join(translate(', ')),
      ]);
    } else {
      html = translate('There is just me, lonely me.');
    }
  } else if (type === 'message') {
    if (!data.id) {
      // System message
      html = `<div class="system">${data.content}</div>`;
    } else {
      let member;
      if (data.id === store.me.id) {
        member = `<span class="nick me">${translate('I')}</span>`;
      } else {
        member = wrapNick(store.memberMap[data.id].nick);
      }
      html = member + translate(' said: ') + safeHtml(data.content);
    }
  } else if (type === 'disconnect') {
    html = translate('Connection lost...');
  }
  if (html) {
    store.messages.push({
      html,
      key: store.messages.length,
    });
  }
}

function sendMessage(content) {
  const matches = content.match(/^\/(\w+)( .*|)$/);
  if (matches) {
    const cmd = matches[1];
    const arg = matches[2];
    if (cmd === 'nick') return socket.emit('nick', arg.trim());
    if (cmd === 'listAll') return socket.emit('listAll');
  }
  socket.emit('message', content);
}

export default {
  data() {
    return store;
  },
  watch: {
    title: 'updateTitle',
  },
  methods: {
    updateTitle() {
      document.title = this.title;
    },
    onSubmit() {
      if (this.content) {
        sendMessage(this.content);
        this.content = '';
      }
    },
  },
  mounted() {
    this.updateTitle();
  },
};
</script>

<style>
* {
  margin: 0;
  padding: 0;
  font-size: 16px;
  box-sizing: border-box;
}
.fullscreen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
}
.contents {
  flex: 1;
  height: 0;
  padding: 10px;
  overflow: auto;
}
.commands {
  position: relative;
  display: flex;
  padding: 8px;
  height: 60px;
  > input {
    flex: 1;
    width: 0;
    padding: 8px;
    font-size: 16px;
    border: 1px solid #bbb;
  }
  > button {
    width: 60px;
    background: #f0f0f0;
  }
}
.status {
  position: absolute;
  top: 0;
  right: 0;
  padding: 10px;
  border-left: 1px solid #888;
  border-bottom: 1px solid #888;
  box-shadow: 0 0 3px #888;
  background: white;
  z-index: 1;
}
.message {
  margin: 10px;
}
.nick {
  padding: 0 2px;
  color: dodgerblue;
}
.me {
  color: green;
}
.system {
  color: #777;
}
</style>
