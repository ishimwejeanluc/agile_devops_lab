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

function shorten(longUrl) {
  if (!isValidUrl(longUrl)) {
    const err = new Error('Invalid URL');
    err.statusCode = 400;
    throw err;
  }

  const shortCode = generateUniqueCode();
  const record = storage.save(shortCode, longUrl);
  return { shortCode, ...record };
}

function resolve(code) {
  return storage.get(code);
}

module.exports = { isValidUrl, shorten, resolve };
