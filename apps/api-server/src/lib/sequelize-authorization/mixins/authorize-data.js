const hasRole = require('../lib/hasRole');

module.exports = function authorizeData(data, action, user, self, project) {

  self = self || this;
  project = project || self.project;

  try {

    if (!self.rawAttributes) throw 'empty';
    if (!user) user = self.auth && self.auth.user;
    if (!user || !user.role) user = { role: 'all' };

    let userId = self.userId;
    if (self.toString().match('SequelizeInstance:user')) { // TODO: find a better check
      userId = self.id
    }

    if (!self.can(action, user)) throw 'cannot';

    let keys = Object.keys( data );

    let result = {};
    keys.forEach((key) => {

      let testRole;
      if (self.rawAttributes[key] && self.rawAttributes[key].auth) {
        if (self.rawAttributes[key].auth.authorizeData) {
          data[key] = self.rawAttributes[key].auth.authorizeData(data[key], action, user, self, project);
          // todo: ik denk dat hij hier moet return-en; een beetje heftige aanpassing voor even tussendoor
        } else {

          // dit is generieker dan de extraData versie; TODO: die moet dus ook zo generiek worden
          testRole = self.rawAttributes[key].auth[action+'ableBy'] || [];
          if (!Array.isArray(testRole)) testRole = [testRole];
          let detailsFieldName = 'details' + action[0].toUpperCase() + action.substring(1) + 'ableByRole';
          if (testRole.includes(detailsFieldName)) {
            if (self[detailsFieldName]) {
              testRole = [ self[detailsFieldName], 'owner' ];
            }
          }

        }
      }

      testRole = testRole && testRole.length ? testRole : (self.auth && self.auth[action+'ableBy']);

      let ownerId = userId;
      if (self.toString().match('SequelizeInstance:user') && self.idpUser && user.idpUser && self.idpUser.identifier && self.idpUser.identifier === user.idpUser.identifier) {
        // special case: users are owner on their users on other projects
        ownerId = user.id;
      }

      if (!hasRole(user, testRole, ownerId)) {
        data[key] = undefined;
      }

    });

  } catch (err) {
    console.log('err', err)
    emptyResult();
  } finally {
    return self;
  }

  function emptyResult() {
    Object.keys( data ).forEach((key) => {
      data[key] = undefined;
    });
  }
}
