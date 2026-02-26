const STORAGE_KEY_PREFIX_REGULAR = 'oscBegrootVotePending';
const STORAGE_KEY_PREFIX_PER_TAG = 'oscBegrootVotePendingPerTag';

export type VotePendingData = { [resourceId: string]: string };
export type VotePendingPerTagData = {
  [tag: string]: { [resourceId: string]: string };
};

class VotePendingStorage {
  private storageKeyRegular: string;
  private storageKeyPerTag: string;

  constructor(projectId?: string | number) {
    const buildKey = (prefix: string) => {
      const parts = [prefix];
      if (projectId) parts.push(`project${projectId}`);
      return parts.join('_');
    };

    this.storageKeyRegular = buildKey(STORAGE_KEY_PREFIX_REGULAR);
    this.storageKeyPerTag = buildKey(STORAGE_KEY_PREFIX_PER_TAG);
  }

  getVotePending(): VotePendingData | null {
    const stored = localStorage.getItem(this.storageKeyRegular);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  getVotePendingPerTag(): VotePendingPerTagData | null {
    const stored = localStorage.getItem(this.storageKeyPerTag);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  setVotePending(data: VotePendingData): void {
    localStorage.setItem(this.storageKeyRegular, JSON.stringify(data));
  }

  setVotePendingPerTag(data: VotePendingPerTagData): void {
    localStorage.setItem(this.storageKeyPerTag, JSON.stringify(data));
  }

  clearVotePending(): void {
    localStorage.removeItem(this.storageKeyRegular);
  }

  clearVotePendingPerTag(): void {
    localStorage.removeItem(this.storageKeyPerTag);
  }

  clearAllVotePending(): void {
    localStorage.removeItem(this.storageKeyRegular);
    localStorage.removeItem(this.storageKeyPerTag);
  }
}

/**
 * Create a new instance of VotePendingStorage
 */
export const createVotePendingStorage = (
  projectId?: string | number
): VotePendingStorage => {
  return new VotePendingStorage(projectId);
};
