#!/usr/bin/env python
# coding=utf-8

def id_generator():
    i = 0
    while True:
        i += 1
        yield i

id_gen = id_generator()

def get_id():
    return next(id_gen)
