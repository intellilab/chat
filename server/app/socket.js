const http = require('http');
const SocketIO = require('socket.io');
const nconf = require('../config');

function initialize(app) {
  const events = [];
  const server = http.createServer(app.callback());
  app.listen = (...args) => server.listen(...args);
  const io = SocketIO(server, {
    path: `${nconf.get('URL_PREFIX')}/ws/`,
  });
  app.io = io;
  io.route = (event, callback) => {
    events.push({ event, callback });
  };
  io.on('connection', client => {
    events.forEach(({ event, callback }) => client.on(event, (...data) => {
      try {
        callback(client, ...data);
      } catch (e) {
        console.error(e);
      }
    }));
  });
}

module.exports = initialize;
