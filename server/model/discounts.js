const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const { DB_ERROR } = require('../errors');
const { discount, product } = require('./schema');

class DiscountModel {
  constructor() {}

  async getDiscounts() {
    // lookup stage
    const Lookup = {
      from: 'products',
      localField: '_id',
      foreignField: 'discountId',
      as: 'usedOnProducts',
    };

    // set stages
    const Set1 = {
      usedOnProducts: {
        $size: '$usedOnProducts',
      },
      expire_in_sec: {
        $dateDiff: {
          startDate: new Date(),
          endDate: '$expire_at',
          unit: 'second',
        },
      },
    };

    const Set2 = {
      expire_in_sec: {
        $cond: [{ $lte: ['$expire_in_sec', 0] }, 0, '$expire_in_sec'],
      },
    };

    // group stage
    const Group = {
      _id: '$_id',
      usedOnProducts: { $first: '$usedOnProducts' },
      percent: { $first: '$usedOnProducts' },
      expiretion_detail: {
        $first: {
          expire_at: '$expire_at',
          expire_in_sec: '$expire_in_sec',
        },
      },
    };

    try {
      return await discount
        .aggregate([
          { $lookup: Lookup },
          { $set: Set1 },
          { $set: Set2 },
          { $group: Group },
        ])
        .exec();
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async addDiscount(products, percent, expiretion) {
    try {
      // create a discount
      const result = await discount.create({
        percent,
        expire_at: expiretion,
      });

      // share the created discount to spedified products
      return await product.updateMany(
        { _id: { $in: products } },
        { $set: { discountId: result._id } }
      );
    } catch (error) {
      console.log(error);
      if (error instanceof CastError || error instanceof ValidationError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }

  async expireDiscount(discountId) {
    try {
      return await discount.findByIdAndDelete({ _id: discountId });
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new DiscountModel();
