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
