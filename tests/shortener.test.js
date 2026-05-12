const shortener = require('../src/shortener');
const storage = require('../src/storage');

beforeEach(() => storage.clear());

describe('isValidUrl', () => {
  test('accepts http and https', () => {
    expect(shortener.isValidUrl('http://example.com')).toBe(true);
    expect(shortener.isValidUrl('https://example.com/x?y=1')).toBe(true);
  });
  test('rejects bad inputs', () => {
    expect(shortener.isValidUrl('')).toBe(false);
    expect(shortener.isValidUrl(null)).toBe(false);
    expect(shortener.isValidUrl('not a url')).toBe(false);
    expect(shortener.isValidUrl('ftp://example.com')).toBe(false);
  });
});

describe('shorten', () => {
  test('auto-generates a 7-char code', () => {
    const r = shortener.shorten('https://example.com');
    expect(r.shortCode).toHaveLength(7);
    expect(r.hits).toBe(0);
  });
  test('accepts valid custom codes', () => {
    expect(shortener.shorten('https://example.com', 'my-code').shortCode).toBe('my-code');
  });
  test('invalid custom code includes statusCode=400', () => {
    try {
      shortener.shorten('https://example.com', 'ab');
      throw new Error('expected to throw');
    } catch (err) {
      expect(err.statusCode).toBe(400);
    }
  });
  test('rejects invalid custom codes', () => {
    expect(() => shortener.shorten('https://example.com', 'ab')).toThrow(/3-20 chars/);
    expect(() => shortener.shorten('https://example.com', 'bad code!')).toThrow(/3-20 chars/);
  });
  test('duplicate custom code includes statusCode=409', () => {
    shortener.shorten('https://a.com', 'taken');
    try {
      shortener.shorten('https://b.com', 'taken');
      throw new Error('expected to throw');
    } catch (err) {
      expect(err.statusCode).toBe(409);
    }
  });
  test('rejects duplicate custom codes', () => {
    shortener.shorten('https://a.com', 'taken');
    expect(() => shortener.shorten('https://b.com', 'taken')).toThrow(/already in use/);
  });
  test('rejects invalid URLs', () => {
    expect(() => shortener.shorten('nope')).toThrow('Invalid URL');
  });
});

describe('resolve / stats', () => {
  test('resolve increments hits; stats does not', () => {
    const r = shortener.shorten('https://example.com');
    shortener.resolve(r.shortCode);
    shortener.resolve(r.shortCode);
    expect(shortener.stats(r.shortCode).hits).toBe(2);
    shortener.stats(r.shortCode);
    expect(shortener.stats(r.shortCode).hits).toBe(2);
  });
  test('resolve returns null for unknown codes', () => {
    expect(shortener.resolve('xxx')).toBeNull();
    expect(shortener.stats('xxx')).toBeNull();
  });
});

describe('storage', () => {
  test('incrementHits is a no-op for missing codes', () => {
    expect(storage.incrementHits('missing')).toBeUndefined();
  });
});
