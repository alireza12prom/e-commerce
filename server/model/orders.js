const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const { DB_ERROR } = require('../errors');
const { order } = require('./schema');

class OrderModel {
  constructor() {}

  async getOrdersList(userId) {
    try {
      return await order.find({ userId }).exec();
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async addToOrdersList(userId, productId, n) {
    try {
      return await order.create({ userId, productId, n });
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

  async deleteFromOrdersList(userId, orderId) {
    try {
      return await order.findOneAndDelete(
        { _id: orderId, userId },
        { returnDocument: 'after' }
      );
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new OrderModel();
