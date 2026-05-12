/**
 * In-memory storage for URL mappings.
 * Sprint 2: extended with a hit counter for click tracking.
 */
class Storage {
  constructor() {
    this.urls = new Map();
  }

  save(code, longUrl) {
    this.urls.set(code, {
      longUrl,
      createdAt: new Date().toISOString(),
      hits: 0,
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

  incrementHits(code) {
    const r = this.urls.get(code);
    if (r) r.hits += 1;
    return r;
  }
}

module.exports = new Storage();
