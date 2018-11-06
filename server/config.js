const nconf = require('nconf');
const nconfFormat = require('nconf-yaml');

nconf
.file({
  file: 'config.yml',
  format: nconfFormat,
})
.argv()
.env()
.defaults({
  NODE_ENV: 'development',
  HOST: '',
  PORT: 2222,
  TOKEN_KEY: '__wctoken',
  URL_PREFIX: '',
});

module.exports = nconf;
