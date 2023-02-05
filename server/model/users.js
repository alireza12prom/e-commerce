const {
  Error: { CastError, ValidationError },
} = require('mongoose');
const { DB_ERROR } = require('../errors');
const { user } = require('./schema');

class UserModel {
  constructor() {}

  async newUser(obj) {
    try {
      return await user.create(obj);
    } catch (error) {
      console.log(error);
      if (error instanceof CastError || error instanceof ValidationError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else if (error.code === 11000) {
        throw DB_ERROR.DOCUMENT_EXISTS;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }

  async findUser(username) {
    try {
      return await user.findOne({ username });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new UserModel();
