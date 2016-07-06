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

app = application = aiohttp.web.Application()
app.router.add_route('GET', '/chat.ws', handle_ws)
app.router.add_route('GET', '/chat', handle_chat)
app.router.add_route('GET', '/chat/{roomId}', handle_chat)
app.router.add_route('GET', '/', handle_def)
app.router.add_static('/static/', 'static')
