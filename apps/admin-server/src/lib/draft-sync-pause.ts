let depth = 0;

/** Runs a form change that the widget draft must not take over. */
export function withoutDraftSync(change: () => void): void {
  depth += 1;
  try {
    change();
  } finally {
    depth -= 1;
  }
}

export function isDraftSyncPaused(): boolean {
  return depth > 0;
}
