class SafeStorage {
  private memoryStorage: Record<string, string> = {};
  private isStorageAvailable = false;

  constructor() {
    try {
      if (typeof window !== 'undefined') {
        const testKey = '__csync_test_storage__';
        window.localStorage.setItem(testKey, 'test');
        window.localStorage.removeItem(testKey);
        this.isStorageAvailable = true;
      }
    } catch (e) {
      this.isStorageAvailable = false;
    }
  }

  getItem(key: string): string | null {
    if (this.isStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        // safe fallback
      }
    }
    return this.memoryStorage[key] || null;
  }

  setItem(key: string, value: string): void {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return;
      } catch (e) {
        // safe fallback
      }
    }
    this.memoryStorage[key] = value;
  }

  removeItem(key: string): void {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
        return;
      } catch (e) {
        // safe fallback
      }
    }
    delete this.memoryStorage[key];
  }

  clear(): void {
    if (this.isStorageAvailable) {
      try {
        window.localStorage.clear();
        return;
      } catch (e) {
        // safe fallback
      }
    }
    this.memoryStorage = {};
  }
}

export const safeStorage = new SafeStorage();
