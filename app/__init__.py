#!/usr/bin/env python
# coding=utf-8
import aiohttp
import aiohttp.web
from .member import Member

async def handle_ws(request):
    ws = aiohttp.web.WebSocketResponse()
    ws.start(request)
    await Member(ws).handle()
    return ws

index_html = open('static/index.html', 'rb').read()
async def handle_chat(request):
    return aiohttp.web.Response(body = index_html)

async def handle_def(request):
    return aiohttp.web.HTTPMovedPermanently('/chat')

application = aiohttp.web.Application()
application.router.add_route('GET', '/chat.ws', handle_ws)
application.router.add_route('GET', '/chat', handle_chat)
application.router.add_route('GET', '/chat/{roomId}', handle_chat)
application.router.add_route('GET', '/', handle_def)
application.router.add_static('/static/', 'static')
