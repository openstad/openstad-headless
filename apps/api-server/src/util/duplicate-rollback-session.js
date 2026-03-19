const DEFAULT_TTL_MS = 60 * 60 * 1000;

function createDuplicateRollbackSessionStore({
  projectModel,
  ttlMs = DEFAULT_TTL_MS,
  uuidFn = () => require('crypto').randomUUID(),
  nowFn = () => Date.now(),
  scheduleFn = (fn, delay) => setTimeout(fn, delay),
}) {
  const memorySessions = new Map();

  function pruneRollbackSessions(sessions = {}) {
    const now = nowFn();
    let changed = false;
    const pruned = {};

    Object.keys(sessions || {}).forEach((key) => {
      const session = sessions[key];
      const createdAt = session && session.createdAt;
      if (createdAt && now - createdAt <= ttlMs && session.data) {
        pruned[key] = session;
        return;
      }
      changed = true;
    });

    return { pruned, changed };
  }

  function createSession({ userId, data }) {
    const sessionId = uuidFn();
    memorySessions.set(sessionId, {
      userId,
      data,
      createdAt: nowFn(),
    });
    scheduleFn(() => {
      memorySessions.delete(sessionId);
    }, ttlMs);
    return sessionId;
  }

  async function saveSessionOnProject({ projectId, sessionId, userId, data }) {
    const project = await projectModel.findByPk(projectId);
    if (!project) return;
    const projectConfig = project.config || {};
    const currentSessions = projectConfig.duplicateRollbackSessions || {};
    const { pruned } = pruneRollbackSessions(currentSessions);
    pruned[sessionId] = {
      userId,
      data,
      createdAt: nowFn(),
    };
    projectConfig.duplicateRollbackSessions = pruned;
    await project.update({ config: projectConfig });
  }

  async function getSession({ rollbackSessionId, projectId }) {
    const memorySession = memorySessions.get(rollbackSessionId);
    if (memorySession) return memorySession;
    if (!projectId) return null;

    const project = await projectModel.findByPk(projectId);
    const projectConfig = (project && project.config) || {};
    const currentSessions = projectConfig.duplicateRollbackSessions || {};
    const { pruned, changed } = pruneRollbackSessions(currentSessions);
    if (changed && project) {
      projectConfig.duplicateRollbackSessions = pruned;
      await project.update({ config: projectConfig });
    }
    const session = pruned[rollbackSessionId];
    if (!session) return null;

    return session;
  }

  async function removeSession({ rollbackSessionId, projectId }) {
    memorySessions.delete(rollbackSessionId);
    if (!projectId) return;

    const project = await projectModel.findByPk(projectId);
    if (
      !project ||
      !project.config ||
      !project.config.duplicateRollbackSessions
    )
      return;

    delete project.config.duplicateRollbackSessions[rollbackSessionId];
    await project.update({ config: project.config });
  }

  return {
    pruneRollbackSessions,
    createSession,
    saveSessionOnProject,
    getSession,
    removeSession,
  };
}

module.exports = {
  createDuplicateRollbackSessionStore,
};
