/**
 * In-memory storage for URL mappings.
 */
class Storage {
  constructor() {
    this.urls = new Map();
  }

  save(code, longUrl) {
    this.urls.set(code, {
      longUrl,
      createdAt: new Date().toISOString(),
    });
    return this.urls.get(code);
  }

  get(code) {
    return this.urls.get(code) || null;
  }

  exists(code) {
    return this.urls.has(code);
  }

  size() {
    return this.urls.size;
  }

  clear() {
    this.urls.clear();
  }
}

module.exports = new Storage();
