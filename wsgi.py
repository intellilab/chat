#!/usr/bin/env python
# coding=utf-8
import argparse
import aiohttp.web
from app import application, config

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description = 'Chat room server')
    parser.add_argument('-H', '--host', default = 'localhost', help = 'Server host')
    parser.add_argument('-p', '--port', default = 2222, help = 'Server port')
    parser.add_argument('--config', default = './config.py', help = 'Specify a config file')
    args = parser.parse_args()
    config.read_file(args.config)
    aiohttp.web.run_app(application, host=args.host, port=args.port)
