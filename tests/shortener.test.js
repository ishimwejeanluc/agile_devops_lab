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
  test('returns a 7-char code', () => {
    const r = shortener.shorten('https://example.com');
    expect(r.shortCode).toHaveLength(7);
  });

  test('accepts valid custom codes', () => {
    const r = shortener.shorten('https://example.com', 'my-code');
    expect(r.shortCode).toBe('my-code');
  });

  test('rejects invalid custom codes', () => {
    expect(() => shortener.shorten('https://example.com', 'ab')).toThrow(/3-20 chars/);
    expect(() => shortener.shorten('https://example.com', 'bad code!')).toThrow(/3-20 chars/);
  });

  test('rejects duplicate custom codes', () => {
    shortener.shorten('https://a.com', 'taken');
    expect(() => shortener.shorten('https://b.com', 'taken')).toThrow(/already in use/);
  });

  test('throws Invalid URL for bad inputs', () => {
    expect(() => shortener.shorten('nope')).toThrow('Invalid URL');
  });
});

describe('resolve', () => {
  test('returns the saved record', () => {
    const r = shortener.shorten('https://example.com');
    const saved = shortener.resolve(r.shortCode);
    expect(saved.longUrl).toBe('https://example.com');
  });

  test('returns null for unknown codes', () => {
    expect(shortener.resolve('missing')).toBeNull();
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
});
