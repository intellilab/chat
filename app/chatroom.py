#!/usr/bin/env python
# coding=utf-8
from .message import Message

class ChatRoom:
    def __init__(self, id = None, max_members = 10):
        self.id = id
        self.max_members = max_members
        self.members = set()

    def broadcast(self, message, excludes = None):
        if excludes: excludes = set(excludes)
        for member in self.members:
            if not excludes or member.id not in excludes:
                member.send(message)

    def add_member(self, member, is_back = False):
        self.members.add(member)
        data = member.info()
        if is_back:
            data['back'] = True
        self.broadcast(Message({'type': 'update', 'data': data}))

    def del_member(self, member):
        self.members.discard(member)
        if self.members:
            self.broadcast(
                Message({'type': 'remove', 'data': member.id}),
                [member.id])
        else:
            chatRooms.pop(self.id, None)

chatRooms = {}

def get_chat_room(room_id):
    chatRoom = chatRooms.get(room_id)
    if chatRoom is None:
        chatRoom = chatRooms[room_id] = ChatRoom(room_id)
    return chatRoom
