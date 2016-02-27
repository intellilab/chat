#!/usr/bin/env python
# coding=utf-8
import json

class Message:
    def __init__(self, data):
        if isinstance(data, str):
            data = json.loads(data)
        self.type = data['type']
        self.data = data.get('data')

    def __str__(self):
        return '{\n\ttype: %s,\n\tdata: %s}' % (self.type, self.data)

    def to_json(self):
        return json.dumps({
            'type': self.type,
            'data': self.data,
        }, separators = (',', ':'))

    def get(self, key, default = None):
        return self.data.get(key, default) if self.data else default
