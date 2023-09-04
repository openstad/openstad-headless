const db = require('../db');

exports.getUserByClientAndRoles = function(email, clientId, roles) {

  return db.User
    .findOne({where: { email }})
    .then( user => {
      return user
        .getRoleForClient(clientId)
        .then( userrole => roles.find(role => role.name == userrole.name) ? user : undefined );
    })

}
