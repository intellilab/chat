#!/usr/bin/env python
# coding=utf-8
import random, aiohttp
from .utils import get_id
from .message import Message
from .chatroom import get_chat_room

class CloseConnection(Exception):
    pass

nicknames = [
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
]

class Member:
    chatRoom = None
    def __init__(self, ws):
        self.id = get_id()
        self.ws = ws
        self.nick = random.choice(nicknames)

    def __hash__(self):
        return self.id

    def send(self, message):
        self.ws.send_str(message.to_json())

    def list_all(self):
        self.send(Message({
            'type': 'listall',
            'data': list(map(Member.info, self.chatRoom.members))
        }))

    def update(self, data):
        nick = data.get('nick')
        if nick:
            self.nick = str(nick)
        self.chatRoom.broadcast(Message({
            'type': 'update',
            'data': self.info()
        }))

    def on_message(self, message):
        if message.type == 'nick':
            self.update(message.data)
        elif message.type == 'message':
            self.chatRoom.broadcast(Message({
                'type': 'message',
                'data': {
                    'id': self.id,
                    'message': message.data
                }
            }))
        elif message.type == 'listall':
            self.list_all()

    def info(self):
        return {
            'id': self.id,
            'nick': self.nick,
        }

    async def get_message(self):
        msg = await self.ws.receive()
        if msg.tp == aiohttp.MsgType.close:
            #print('websocket connection closed')
            raise CloseConnection
        if msg.tp == aiohttp.MsgType.error:
            #print('ws connection closed with exception %s', self.ws.exception())
            raise CloseConnection
        if msg.tp == aiohttp.MsgType.text:
            try:
                return Message(msg.data)
            except:
                pass

    async def handshake(self):
        self.send(Message({
            'type': 'init',
            'data': {
                'id': self.id,
            },
        }))
        msg = await self.get_message()
        assert msg.type == 'init'
        nick = msg.get('nick')
        if nick: self.nick = nick
        self.chatRoom = get_chat_room(msg.get('room'))
        self.chatRoom.add_member(self, bool(msg.get('back')))

    async def handle(self):
        try:
            await self.handshake()
            while True:
                self.on_message(await self.get_message())
        except CloseConnection:
            pass
        except:
            import traceback
            traceback.print_exc()
        if self.chatRoom:
            self.chatRoom.del_member(self)
        await self.ws.close()
