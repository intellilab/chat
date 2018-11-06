class Storage {
  constructor(provider) {
    this.provider = provider;
  }

  get(key, def) {
    let data;
    try {
      const raw = this.provider.getItem(key);
      data = JSON.parse(raw || '');
    } catch (e) {
      data = def;
    }
    return data;
  }

  set(key, value) {
    this.provider.setItem(key, JSON.stringify(value));
  }

  clear() {
    this.provider.clear();
  }
}

const storages = {};

export function register(name, provider) {
  storages[name] = new Storage(provider);
}

export function getStorage(name) {
  return storages[name || ''];
}

register('', window.sessionStorage);
