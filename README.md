Chat
===

A simple single-process chat room application implemented with Python 3.5+, based on websocket.

Start
---
You may create a `config.py` to customize your configurations.

``` sh
$ pip3 install -r requirements.txt

$ python3 wsgi.py
# Or
$ python3 wsgi.py -H 0.0.0.0 -p 2222

# Visit your chat room by `http://ip:2222`
```
