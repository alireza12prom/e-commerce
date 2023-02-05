const { DB_ERROR } = require('../errors');
const { blockedUsers } = require('./schema');

class blockedUsersModel {
  constructor() {}

  async newUser(userId, expiretion) {
    try {
      await blockedUsers.create({ userId, expire_at: expiretion });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async isBlockedUser(userId) {
    try {
      return await blockedUsers.exists({ userId });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new blockedUsersModel();
