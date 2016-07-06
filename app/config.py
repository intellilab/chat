#!/usr/bin/env python
# coding=utf-8

nicknames = [
    'Gerald',
    'Naruto',
    'Kakashi',
    'Sakura',
    'Itachi',
    'Minato',
    'Obito',
    'Gaara',
    'Shikamaru',
    'Orochimaru',
    'Jiraiya',
    'Hinata',
    'Yamato',
    'Neji',
    'Tsunade',
    'Kurama',
    'Sasori',
    'Kiba',
    'Luffy',
]

def read_file(filename):
    import importlib.util
    try:
        spec = importlib.util.spec_from_file_location('config', filename)
        config = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(config)
    except:
        pass
    else:
        attrs = getattr(config, '__all__', dir(config))
        GLOBALS = globals()
        for key in attrs:
            GLOBALS[key] = getattr(config, key)
