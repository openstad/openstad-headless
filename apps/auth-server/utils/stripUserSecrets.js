const stripUserSecrets = (user) => {
  delete user.password;
  delete user.hashedPhoneNumber;
  delete user.twoFactorToken;
  delete user.resetPasswordToken;
  return user;
};

module.exports = stripUserSecrets;
