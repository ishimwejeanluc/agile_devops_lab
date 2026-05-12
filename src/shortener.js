const { nanoid } = require('nanoid');
const validUrl = require('valid-url');
const storage = require('./storage');

const CODE_LENGTH = 7;

function isValidUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) return false;
  return Boolean(validUrl.isWebUri(url));
}

function generateUniqueCode() {
  let code;
  let attempts = 0;
  do {
    code = nanoid(CODE_LENGTH);
    if (++attempts > 5) throw new Error('Could not generate a unique short code');
  } while (storage.exists(code));
  return code;
}

function shorten(longUrl, customCode = null) {
  if (!isValidUrl(longUrl)) {
    const err = new Error('Invalid URL');
    err.statusCode = 400;
    throw err;
  }

  let shortCode;
  if (customCode) {
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(customCode)) {
      const err = new Error('Custom code must be 3-20 chars (letters, digits, _ or -)');
      err.statusCode = 400;
      throw err;
    }
    if (storage.exists(customCode)) {
      const err = new Error('Custom code already in use');
      err.statusCode = 409;
      throw err;
    }
    shortCode = customCode;
  } else {
    shortCode = generateUniqueCode();
  }

  const record = storage.save(shortCode, longUrl);
  return { shortCode, ...record };
}

function resolve(code) {
  const r = storage.get(code);
  if (!r) return null;
  storage.incrementHits(code);
  return r;
}

function stats(code) {
  return storage.get(code);
}

module.exports = { isValidUrl, shorten, resolve, stats };
