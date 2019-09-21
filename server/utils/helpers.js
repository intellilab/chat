const { createLogger, transports, format } = require('winston');

const loggers = {};

function newLogger(name) {
  return createLogger({
    transports: [
      new transports.Console({ level: 'info' }),
    ].filter(Boolean),
    format: format.combine(
      format.splat(),
      format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS',
      }),
      format.printf(info => `${info.timestamp} [${name}][${info.level}] ${info.message}`),
    ),
  });
}

function getLogger(name = 'lazy-dog') {
  let logger = loggers[name];
  if (!logger) {
    logger = newLogger(name);
    loggers[name] = logger;
  }
  return logger;
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
