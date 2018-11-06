let id = 0;
function getId() {
  id += 1;
  return id;
}

function randomChoice(list) {
  return list[Math.random() * list.length | 0];
}

// const nicknames = [
//   'Gerald',
//   'Naruto',
//   'Kakashi',
//   'Sakura',
//   'Itachi',
//   'Minato',
//   'Obito',
//   'Gaara',
//   'Shikamaru',
//   'Orochimaru',
//   'Jiraiya',
//   'Hinata',
//   'Yamato',
//   'Neji',
//   'Tsunade',
//   'Kurama',
//   'Sasori',
//   'Kiba',
//   'Luffy',
// ];
const nicknames = [
  '杰伦',
  '冰冰',
  '一叶障目',
  '韭菜花',
  '郭靖',
  '黄蓉',
  '小杨过',
  '小龙女',
  '雕儿',
  '翠花',
  '周伯通',
  '糖醋里脊',
  '香菇青菜',
  '麻辣豆腐',
];

const memberMap = new Map();
const roomMap = new Map();

class Member {
  constructor(client, room) {
    this.id = getId();
    this.client = client;
    this.room = room;
    this.nick = randomChoice(nicknames);
    memberMap.set(client, this);
  }

  info() {
    return {
      id: this.id,
      nick: this.nick,
    };
  }

  update({ nick }) {
    if (nick) this.nick = nick;
  }

  remove() {
    memberMap.delete(this.client);
    this.room.removeMember(this);
  }
}

class Room {
  constructor(id) {
    this.id = id;
    this.members = new Set();
  }

  addMember(client) {
    if (getMember(client)) return;
    const member = new Member(client, this);
    this.members.add(member);
    return member;
  }

  removeMember(member) {
    this.members.delete(member);
  }

  listAll() {
    const members = [];
    for (const member of this.members) {
      members.push(member.info());
    }
    return members;
  }

  broadcast(...args) {
    for (const member of this.members) {
      member.client.emit(...args);
    }
  }
}

function getMember(client) {
  return memberMap.get(client);
}

function getRoom(id) {
  const roomId = id || '';
  let room = roomMap[roomId];
  if (!room) {
    room = new Room(roomId);
    roomMap[roomId] = room;
  }
  return room;
}

exports.getMember = getMember;
exports.getRoom = getRoom;
