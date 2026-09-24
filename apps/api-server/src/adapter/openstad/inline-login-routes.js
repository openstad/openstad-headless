const config = require('config');
const jwt = require('jsonwebtoken');
const db = require('../../db');
const authSettings = require('../../util/auth-settings');
const mapUserData = require('../../util/map-user-data');
const sessionDuration = require('../../util/session-duration');
const service = require('./service');
const {
  applyClientConsents,
  evaluateClientGates,
  fieldLabelsFor,
  mintJwt,
  pickAllowedFields,
  privacyLinkFor,
  resolveTargetRole,
  upsertProjectUser,
} = require('./inline-login');

const verifyJwt = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, config.auth['jwtSecret']);
  } catch (err) {
    return null;
  }
};

const isOpenstadAdapter = (authConfig) =>
  (authConfig.adapter || 'openstad') === 'openstad';

const loadTargetUser = ({ authConfig, identifier }) =>
  Promise.all([
    service.fetchClient({ authConfig }),
    service.fetchUserData({ authConfig, userId: identifier, raw: true }),
  ]);

const hasUniqueCodeFor = async ({ authConfig, client, identifier }) => {
  const authTypes = client.authTypes || [];
  if (authTypes.length !== 1 || authTypes[0] !== 'UniqueCode') return false;
  const codes = await service.fetchUniqueCodesForUser({
    authConfig,
    userId: identifier,
  });
  return codes.total > 0;
};

const toProjectUserData = ({
  authConfig,
  rawUser,
  role,
  client,
  projectId,
}) => {
  const mapped = mapUserData({ map: authConfig.userMapping, user: rawUser });
  mapped.idpUser.provider = authConfig.provider;
  return applyClientConsents({
    ...mapped,
    role,
    clientId: client.id,
    projectId,
  });
};

const respondWithGates = async ({
  req,
  res,
  client,
  rawUser,
  role,
  hasUniqueCode,
}) => {
  const authConfig = req.authConfig;
  const projectId = req.project.id;
  const gates = evaluateClientGates({
    client,
    user: rawUser,
    role,
    projectId,
    hasUniqueCode,
  });

  if (gates.status === 'environment_forbidden') {
    return res.status(403).json({ status: gates.status });
  }
  if (!gates.ok && gates.status !== 'fields_required') {
    return res.status(409).json({ status: gates.status });
  }

  const userId = await upsertProjectUser({
    User: db.User,
    project: req.project,
    userData: toProjectUserData({
      authConfig,
      rawUser,
      role,
      client,
      projectId,
    }),
  });

  if (!gates.ok) {
    const pendingJwt = await mintJwt({
      authConfig,
      userId,
      role,
      projectId,
      pending: true,
    });
    return res.status(409).json({
      status: gates.status,
      missingFields: gates.missingFields,
      pendingJwt,
      labels: fieldLabelsFor(client),
      privacy: privacyLinkFor(client),
    });
  }

  const token = await mintJwt({ authConfig, userId, role, projectId });
  const response = { jwt: token };
  if (sessionDuration.shouldExpireOnClose(role)) {
    response.expireOnClose = true;
  }
  return res.json(response);
};

exports.exchange = async (req, res, next) => {
  try {
    const claims = verifyJwt(req.body && req.body.sourceJwt);
    if (!claims || claims.pending) {
      return res.status(401).json({ status: 'invalid_token' });
    }

    const sourceUser = await db.User.findOne({ where: { id: claims.userId } });
    if (
      !sourceUser ||
      !sourceUser.idpUser ||
      sourceUser.role === 'anonymous' ||
      sourceUser.idpUser.provider === 'anonymous'
    ) {
      return res.status(401).json({ status: 'not_allowed' });
    }

    const sourceProject = await db.Project.findOne({
      where: { id: sourceUser.projectId },
    });
    const sourceAuthConfig =
      sourceProject &&
      (await authSettings.config({
        project: sourceProject,
        useAuth: sourceUser.idpUser.provider,
      }));
    const authConfig = req.authConfig;
    if (
      !sourceAuthConfig ||
      !isOpenstadAdapter(sourceAuthConfig) ||
      !isOpenstadAdapter(authConfig) ||
      sourceAuthConfig.serverUrlInternal !== authConfig.serverUrlInternal
    ) {
      return res.status(401).json({ status: 'not_allowed' });
    }

    const identifier = sourceUser.idpUser.identifier;
    const [client, rawUser] = await loadTargetUser({ authConfig, identifier });
    const role = resolveTargetRole({ rawUser, clientId: authConfig.clientId });
    const hasUniqueCode = await hasUniqueCodeFor({
      authConfig,
      client,
      identifier,
    });

    return await respondWithGates({
      req,
      res,
      client,
      rawUser,
      role,
      hasUniqueCode,
    });
  } catch (err) {
    return next(err);
  }
};

exports.uniqueCodeLogin = async (req, res, next) => {
  try {
    const code = req.body && req.body.code;
    if (!code) {
      return res.status(400).json({ status: 'code_required' });
    }

    const authConfig = req.authConfig;
    const result = await service.loginWithUniqueCode({
      authConfig,
      code,
      ip: req.ip,
    });
    if (result.status === 404) {
      return res.status(401).json({ status: 'invalid_code' });
    }
    if (result.status === 429) {
      return res.status(429).json({ status: 'too_many_attempts' });
    }
    if (result.status !== 200) {
      throw new Error(`Unique code login failed with status ${result.status}`);
    }

    const client = await service.fetchClient({ authConfig });

    return await respondWithGates({
      req,
      res,
      client,
      rawUser: result.data.user,
      role: result.data.role,
      hasUniqueCode: true,
    });
  } catch (err) {
    return next(err);
  }
};

exports.completeFields = async (req, res, next) => {
  try {
    const claims = verifyJwt(req.body && req.body.pendingJwt);
    if (!claims || !claims.pending || claims.projectId !== req.project.id) {
      return res.status(401).json({ status: 'invalid_token' });
    }

    const fields = req.body.fields;
    if (!fields || typeof fields !== 'object' || Array.isArray(fields)) {
      return res.status(400).json({ status: 'fields_missing' });
    }

    const projectUser = await db.User.findOne({
      where: { id: claims.userId, projectId: req.project.id },
    });
    if (!projectUser || !projectUser.idpUser) {
      return res.status(401).json({ status: 'invalid_token' });
    }

    const authConfig = req.authConfig;
    const identifier = projectUser.idpUser.identifier;
    const [client, rawUser] = await loadTargetUser({ authConfig, identifier });
    const role = resolveTargetRole({ rawUser, clientId: authConfig.clientId });
    const hasUniqueCode = await hasUniqueCodeFor({
      authConfig,
      client,
      identifier,
    });
    const gates = evaluateClientGates({
      client,
      user: rawUser,
      role,
      projectId: req.project.id,
      hasUniqueCode,
    });

    if (gates.status !== 'fields_required') {
      return await respondWithGates({
        req,
        res,
        client,
        rawUser,
        role,
        hasUniqueCode,
      });
    }

    const allowed = pickAllowedFields({
      fields,
      missingFields: gates.missingFields,
    });

    if (Object.prototype.hasOwnProperty.call(allowed, 'accessCode')) {
      const valid = await service.validateAccessCode({
        authConfig,
        code: allowed.accessCode,
      });
      if (!valid) {
        return res
          .status(422)
          .json({ status: 'invalid_fields', invalidFields: ['accessCode'] });
      }
    }

    if (Object.keys(allowed).length > 0) {
      await service.updateUser({
        authConfig,
        userData: { id: identifier, ...allowed },
      });
    }

    const [updatedClient, updatedUser] = await loadTargetUser({
      authConfig,
      identifier,
    });
    return await respondWithGates({
      req,
      res,
      client: updatedClient,
      rawUser: updatedUser,
      role,
      hasUniqueCode,
    });
  } catch (err) {
    return next(err);
  }
};
