const db = require('../db');

const windowMs = 15 * 60 * 1000;
const maxFailuresPerIp = 20;
const maxFailuresPerClient = 200;

const isLocked = async ({ clientId, ip }) => {
  const createdAt = { [db.Sequelize.Op.gte]: new Date(Date.now() - windowMs) };

  const clientFailures = await db.LoginAttempt.count({
    where: { clientId, createdAt },
  });
  if (clientFailures >= maxFailuresPerClient) return true;
  if (!ip) return false;

  const ipFailures = await db.LoginAttempt.count({
    where: { clientId, ip, createdAt },
  });
  return ipFailures >= maxFailuresPerIp;
};

const registerFailure = ({ clientId, ip }) =>
  db.LoginAttempt.create({ clientId, ip: ip || null });

module.exports = {
  isLocked,
  registerFailure,
  maxFailuresPerIp,
  maxFailuresPerClient,
};
