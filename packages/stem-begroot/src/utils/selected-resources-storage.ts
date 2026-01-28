const STORAGE_KEY_PREFIX = 'oscBegrootSelectedResources';

class SelectedResourcesStorage {
  private storageKey: string;

  constructor(projectId?: string | number) {
    const parts = [STORAGE_KEY_PREFIX];
    if (projectId) parts.push(`project${projectId}`);
    this.storageKey = parts.join('_');
  }

  /**
   * Get selected resources from localStorage
   */
  getSelectedResources(): any[] | null {
    const stored = localStorage.getItem(this.storageKey);
    if (!stored) return null;
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }

  /**
   * Save selected resources to localStorage
   */
  setSelectedResources(resources: any[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(resources));
  }

  /**
   * Clear selected resources from localStorage
   */
  clearSelectedResources(): void {
    localStorage.removeItem(this.storageKey);
  }
}

/**
 * Create a new instance of SelectedResourcesStorage
 */
export const createSelectedResourcesStorage = (
  projectId?: string | number
): SelectedResourcesStorage => {
  return new SelectedResourcesStorage(projectId);
};

