'use strict';

const { DB_ERROR } = require('../errors');
const { apikeys } = require('./schema');

class ApikeysModel {
  constructor() {}

  async newApikey(userId, apikey, expiretion, as) {
    try {
      await apikeys.create({ userId, apikey, as, expire_at: expiretion });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async dropApikey(userId) {
    try {
      return await apikeys.deleteOne({ userId });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async findUserByApikey(apikey) {
    try {
      return await apikeys.findOne({ apikey });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async findUserById(userId) {
    try {
      return await apikeys.findOne({ userId });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new ApikeysModel();
