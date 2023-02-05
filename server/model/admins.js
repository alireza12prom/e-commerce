const { DB_ERROR } = require('../errors');
const { admins } = require('./schema');

class AdminsModel {
  constructor() {}

  async findAdmin(username) {
    try {
      return await admins.findOne({ username });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new AdminsModel();
