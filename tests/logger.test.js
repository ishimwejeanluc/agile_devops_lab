const originalEnv = process.env;

function loadLogger({ NODE_ENV, LOG_LEVEL } = {}) {
  process.env = { ...originalEnv };
  if (NODE_ENV !== undefined) process.env.NODE_ENV = NODE_ENV;
  if (LOG_LEVEL !== undefined) process.env.LOG_LEVEL = LOG_LEVEL;

  jest.resetModules();
  // eslint-disable-next-line global-require
  return require('../src/logger');
}

describe('logger', () => {
  let logSpy;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    process.env = { ...originalEnv };
    jest.resetModules();
  });

  test('is silent in NODE_ENV=test', () => {
    const logger = loadLogger({ NODE_ENV: 'test', LOG_LEVEL: 'debug' });
    logger.info('hello', { a: 1 });
    logger.error('boom');
    expect(logSpy).not.toHaveBeenCalled();
  });

  test('emits JSON with required fields', () => {
    const logger = loadLogger({ NODE_ENV: 'development', LOG_LEVEL: 'info' });
    logger.info('request', { method: 'GET', path: '/', status: 200, durationMs: 3 });

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload).toHaveProperty('ts');
    expect(payload.level).toBe('info');
    expect(payload.message).toBe('request');
    expect(payload.method).toBe('GET');
    expect(payload.path).toBe('/');
    expect(payload.status).toBe(200);
    expect(payload.durationMs).toBe(3);
  });

  test('LOG_LEVEL=warn filters out debug and info', () => {
    const logger = loadLogger({ NODE_ENV: 'development', LOG_LEVEL: 'warn' });
    logger.debug('d');
    logger.info('i');
    logger.warn('w');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload.level).toBe('warn');
    expect(payload.message).toBe('w');
  });

  test('LOG_LEVEL=error filters out warn', () => {
    const logger = loadLogger({ NODE_ENV: 'development', LOG_LEVEL: 'error' });
    logger.warn('w');
    logger.error('e');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload.level).toBe('error');
    expect(payload.message).toBe('e');
  });

  test('invalid LOG_LEVEL falls back to info', () => {
    const logger = loadLogger({ NODE_ENV: 'development', LOG_LEVEL: 'nope' });
    logger.info('ok');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload.level).toBe('info');
    expect(payload.message).toBe('ok');
  });

  test('meta is optional', () => {
    const logger = loadLogger({ NODE_ENV: 'development', LOG_LEVEL: 'info' });
    logger.error('oops');

    expect(logSpy).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(logSpy.mock.calls[0][0]);
    expect(payload.level).toBe('error');
    expect(payload.message).toBe('oops');
  });
});
