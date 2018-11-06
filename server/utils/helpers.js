const winston = require('winston');

function getLogger(label) {
  return winston.loggers.get(label, {
    console: {
      label,
      timestamp: true,
    },
  });
}

function wraps(func, options) {
  func.__name__ = options.name;
  func.__doc__ = options.doc;
  return func;
}

function setError(ctx, code, error) {
  ctx.status = code;
  ctx.body = { error };
}

exports.getLogger = getLogger;
exports.wraps = wraps;
exports.setError = setError;
