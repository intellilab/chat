import nconf from 'nconf';
import nconfFormat from 'nconf-yaml';

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
  PREFIX: '',
});

export default nconf;
