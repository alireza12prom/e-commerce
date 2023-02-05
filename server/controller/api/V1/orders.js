'use strict';

const {
  DB_ERROR,
  NotFoundError,
  CustomAPIErrors,
  BadRequestError,
  IntervalServerError,
} = require('../../../errors');

const { StatusCodes } = require('http-status-codes');
const { Order } = require('../../../model');
const { product } = require('../../../model/schema');

class OrderController {
  constructor() {}

  async getOrdersList(request, response) {
    const { id } = request.user;

    try {
      const result = await Order.getOrdersList(id);

      const ResponseObject = { n: result.length, orders: result };
      response.status(StatusCodes.OK).json(ResponseObject);
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async saveToOrders(request, response) {
    const {
      body: { productId, n },
      user: { id },
    } = request;

    try {
      const Filter = { _id: productId, quentity: { $gte: n } };
      const exists = await product.exists(Filter);

      if (!exists)
        throw new NotFoundError('Product not found or quentity is not enaugh');

      await Order.addToOrdersList(id, productId, n);
      response.status(StatusCodes.CREATED).json({ msg: 'OK' });
    } catch (error) {
      console.log(error);
      if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs are wrong');
      } else if (error === DB_ERROR.DOCUMENT_EXISTS) {
        throw new BadRequestError(
          'You have already added this product in your orders'
        );
      } else if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async deleteFromOrders(request, response) {
    const {
      body: { orderId },
      user: { id },
    } = request;

    try {
      const result = await Order.deleteFromOrdersList(id, orderId);
      if (!result) throw new NotFoundError('Product is not in your orders');

      response.status(StatusCodes.OK).json({ msg: 'OK' });
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }
}

module.exports = new OrderController();
