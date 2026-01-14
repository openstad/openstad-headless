const STORAGE_KEY_PREFIX_REGULAR = 'oscBegrootVotePending';
const STORAGE_KEY_PREFIX_PER_TAG = 'oscBegrootVotePendingPerTag';

export type VotePendingData = { [key: string]: any };
export type VotePendingPerTagData = { [tag: string]: { [key: string]: any } };

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
    return stored ? JSON.parse(stored) : null;
  }

  getVotePendingPerTag(): VotePendingPerTagData | null {
    const stored = localStorage.getItem(this.storageKeyPerTag);
    return stored ? JSON.parse(stored) : null;
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

