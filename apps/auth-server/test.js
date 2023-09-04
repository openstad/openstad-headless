require('dotenv').config();
const db = require('./db');

( async function() {

  // let AccessToken = await db.AccessToken.findOne();
  // console.log(JSON.stringify(AccessToken, null, 2));

  // let ActionLog = await db.ActionLog.findOne();
  // console.log(JSON.stringify(ActionLog, null, 2));

  // let Client = await db.Client.findOne();
  // console.log(JSON.stringify(Client, null, 2));

  // let ExternalCsrfToken = await db.ExternalCsrfToken.findOne();
  // console.log(JSON.stringify(ExternalCsrfToken, null, 2));

  // let LoginToken = await db.LoginToken.findOne();
  // console.log(JSON.stringify(LoginToken, null, 2));

  // let PasswordResetToken = await db.PasswordResetToken.findOne();
  // console.log(JSON.stringify(PasswordResetToken, null, 2));

  // let Role = await db.Role.findOne();
  // console.log(JSON.stringify(Role, null, 2));

  // let UniqueCode = await db.UniqueCode.findOne();
  // console.log(JSON.stringify(UniqueCode, null, 2));

  // let User = await db.User.findOne();
  // console.log(JSON.stringify(User, null, 2));

  // let UserRole = await db.UserRole.findOne();
  // console.log(JSON.stringify(UserRole, null, 2));

  // let user = await db.User.findOne({where: {id: 123}});
  // console.log(JSON.stringify(user, null, 2));

  let result = await db.User.findOne({ where: { id: 123 } });
  console.log(JSON.stringify(result, null, 2));

  let x = await result.getRoleForClient('uniekecodes')
  console.log(x);

  process.exit();
  
})()

