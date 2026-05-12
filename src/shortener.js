const validUrl = require('valid-url');

function isValidUrl(url) {
  if (typeof url !== 'string' || url.trim().length === 0) return false;
  return Boolean(validUrl.isWebUri(url));
}

module.exports = { isValidUrl };
