'use strict';

const {
  DB_ERROR,
  IntervalServerError,
  BadRequestError,
  CustomAPIErrors,
  NotFoundError,
} = require('../../../errors');

const { StatusCodes } = require('http-status-codes');
const { Discount } = require('../../../model');
const { product } = require('../../../model/schema');

class DiscountController {
  constructor() {}

  async getDiscounts(request, response) {
    try {
      const result = await Discount.getDiscounts();

      const ResponseObject = { n: result.length, discounts: result };
      response.status(StatusCodes.OK).json(ResponseObject);
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async addDiscount(request, response) {
    const { products, expiretion, percent } = request.body;

    try {
      let exists = await product
        .find({ _id: { $in: products } }, { _id: 1 })
        .exec();

      if (exists.length != products.length) {
        throw new BadRequestError(`one of the products id is not exists`);
      }

      await Discount.addDiscount(products, percent, expiretion);
      response.status(StatusCodes.CREATED).json({ msg: 'OK' });
    } catch (error) {
      if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs are not valid');
      } else if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async expireDiscount(request, response) {
    const { discountId } = request.body;

    try {
      const result = await Discount.expireDiscount(discountId);
      if (!result) throw new NotFoundError('Discount not found');

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

module.exports = new DiscountController();
