const db = require('../db');

const windowMs = 15 * 60 * 1000;
const maxFailuresPerIp = 20;
const maxFailuresPerClient = 200;

// Returns 'client', 'ip' or null; callers fall back to another login flow
// on a client lock, since that one can be triggered by anyone
const lockScope = async ({ clientId, ip }) => {
  const createdAt = { [db.Sequelize.Op.gte]: new Date(Date.now() - windowMs) };

  const clientFailures = await db.LoginAttempt.count({
    where: { clientId, createdAt },
  });
  if (clientFailures >= maxFailuresPerClient) return 'client';
  if (!ip) return null;

  const ipFailures = await db.LoginAttempt.count({
    where: { clientId, ip, createdAt },
  });
  return ipFailures >= maxFailuresPerIp ? 'ip' : null;
};

const registerFailure = ({ clientId, ip }) =>
  db.LoginAttempt.create({ clientId, ip: ip || null });

module.exports = {
  lockScope,
  registerFailure,
  maxFailuresPerIp,
  maxFailuresPerClient,
};
