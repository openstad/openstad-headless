const STORAGE_KEY_PREFIX = 'oscBegrootVoteCompleted';

type VoteCompletedState = {
  showStep4AfterLogout: boolean;
};

class VoteCompletedStorage {
  private storageKey: string;

  constructor(projectId?: string | number) {
    const parts = [STORAGE_KEY_PREFIX];
    if (projectId) parts.push(`project${projectId}`);
    this.storageKey = parts.join('_');
  }

  getState(): VoteCompletedState | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  setState(state: VoteCompletedState): void {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  consumeShowStep4AfterLogout(): boolean {
    const state = this.getState();
    if (!state?.showStep4AfterLogout) return false;
    this.clearState();
    return true;
  }

  clearState(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const createVoteCompletedStorage = (
  projectId?: string | number
): VoteCompletedStorage => {
  return new VoteCompletedStorage(projectId);
};
