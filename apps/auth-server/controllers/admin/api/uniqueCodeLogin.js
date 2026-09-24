const db = require('../../../db');
const authCodeConfig = require('../../../config/auth').get('UniqueCode');
const auditLog = require('../../../middleware/auditLog');
const lockout = require('../../../utils/uniqueCodeLockout');

const auditMethod = 'uniqueCodeInline';

const auditRequest = (req, user) => ({
  user: user || {},
  ip: req.ip,
  headers: req.headers,
  originalUrl: req.originalUrl,
});

const outputUser = (user) => {
  const result = { ...user.dataValues };
  delete result.password;
  delete result.hashedPhoneNumber;
  return result;
};

exports.post = async (req, res, next) => {
  const client = req.user;
  const code = req.body && req.body.code;
  const ip = req.body && req.body.ip;

  if (!code) {
    return res.status(400).json({ error: 'code_required' });
  }

  try {
    if (await lockout.isLocked({ clientId: client.id, ip })) {
      return res.status(429).json({ error: 'too_many_attempts' });
    }

    const uniqueCode = await db.UniqueCode.findOne({
      where: { code, clientId: client.id },
    });

    if (!uniqueCode) {
      await lockout.registerFailure({ clientId: client.id, ip });
      auditLog.logAuthEvent(auditRequest(req), 'login_failed', {
        data: { method: auditMethod },
      });
      return res.status(404).json({ error: 'invalid_code' });
    }

    const isNew = !uniqueCode.userId;
    let user;

    if (isNew) {
      user = await db.User.create({});
      await uniqueCode.update({ userId: user.id });
    } else {
      user = await db.User.findOne({ where: { id: uniqueCode.userId } });
      if (!user) {
        auditLog.logAuthEvent(auditRequest(req), 'login_failed', {
          data: { method: auditMethod },
        });
        return res.status(404).json({ error: 'invalid_code' });
      }
    }

    const userRole = await db.UserRole.findOne({
      where: { clientId: client.id, userId: user.id },
    });

    if (!userRole) {
      const defaultRoleId = client.config.defaultRoleId
        ? client.config.defaultRoleId
        : authCodeConfig.defaultRoleId;
      await db.UserRole.create({
        clientId: client.id,
        roleId: defaultRoleId,
        userId: user.id,
      });
    }

    const role = await user.getRoleForClient(client.id);

    auditLog.logAuthEvent(auditRequest(req, user), 'login', {
      data: { method: auditMethod },
    });

    return res.json({ user: outputUser(user), role, isNew });
  } catch (err) {
    return next(err);
  }
};
