const hasIdentity = ({ provider, identifier }) =>
  Boolean(provider) && identifier != null && identifier !== '';

const revoke = async ({ db, provider, identifier, at = new Date() }) => {
  if (!hasIdentity({ provider, identifier })) return null;
  return db.LoginRevocation.upsert({
    provider,
    identifier: String(identifier),
    revokedAt: at,
  });
};

const isRevoked = async ({ db, provider, identifier, issuedAt }) => {
  if (!hasIdentity({ provider, identifier })) return false;
  const revocation = await db.LoginRevocation.findOne({
    where: { provider, identifier: String(identifier) },
  });
  if (!revocation) return false;
  if (issuedAt == null) return true;
  return issuedAt <= Math.floor(revocation.revokedAt.getTime() / 1000);
};

module.exports = { revoke, isRevoked };
