#!/usr/bin/env python
# coding=utf-8
import argparse
import aiohttp.web
from . import application

parser = argparse.ArgumentParser(description = 'Chat room server')
parser.add_argument('-H', '--host', default = 'localhost', help = 'Server host')
parser.add_argument('-p', '--port', default = 2222, help = 'Server port')
args = parser.parse_args()
aiohttp.web.run_app(application, host=args.host, port=args.port)
