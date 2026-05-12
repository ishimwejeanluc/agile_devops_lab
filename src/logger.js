/**
 * JSON-lines structured logger (added in Sprint 2).
 * Silent in NODE_ENV=test to keep test output clean.
 */
const LEVELS = { debug: 10, info: 20, warn: 30, error: 40 };
const currentLevel = LEVELS[(process.env.LOG_LEVEL || 'info').toLowerCase()] || LEVELS.info;

function emit(level, message, meta = {}) {
  if (LEVELS[level] < currentLevel) return;
  if (process.env.NODE_ENV === 'test') return;
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ts: new Date().toISOString(), level, message, ...meta }));
}

module.exports = {
  debug: (m, x) => emit('debug', m, x),
  info:  (m, x) => emit('info',  m, x),
  warn:  (m, x) => emit('warn',  m, x),
  error: (m, x) => emit('error', m, x),
};
