const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const { DB_ERROR } = require('../errors');
const { product } = require('./schema');

class ProductModel {
  constructor() {}

  async getProducts(filter, pagination, sort) {
    // match stage
    const Match = {};
    const { category, price_s, price_e, brand } = filter;
    if (category) Match.category = category;
    if (brand) Match.brand = brand;
    if (price_s || price_e)
      Match.price = { $gte: price_s, $lte: price_e || +Infinity };

    // sort stage
    const SortObject = {};
    const { price, likes, rate } = sort;
    if (rate) SortObject.rate = rate;
    if (price) SortObject.price = price;
    if (likes) SortObject.likes = likes;

    // lookup stages
    const Lookup1 = {
      from: 'comments',
      localField: '_id',
      foreignField: 'productId',
      as: 'comments',
    };

    const Lookup2 = {
      from: 'favorites',
      localField: '_id',
      foreignField: 'productId',
      as: 'likes',
    };

    const Lookup3 = {
      from: 'discounts',
      localField: 'discountId',
      foreignField: '_id',
      as: 'discount',
    };

    // set stage
    const Set1 = {
      discount: { $arrayElemAt: ['$discount', 0] },
    };

    const Set2 = {
      rate: {
        $cond: [
          { $eq: [{ $sum: '$comments.score' }, 0] },
          0,
          { $divide: [{ $sum: '$comments.score' }, { $size: '$comments' }] },
        ],
      },
      comments: {
        $size: '$comments',
      },
      likes: {
        $size: '$likes',
      },
      price: {
        original: '$price',
        with_discount: {
          $cond: [
            { $eq: ['$discount', true] },
            0,
            {
              $multiply: ['$price', { $divide: ['$discount.percent', 100] }],
            },
          ],
        },
      },
    };

    // project stage
    const Project = {
      discountId: 0,
      discount: 0,
    };

    // limit & skip stages
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    try {
      return await product
        .aggregate([
          { $match: Match },
          { $lookup: Lookup1 },
          { $lookup: Lookup2 },
          { $lookup: Lookup3 },
          { $set: Set1 },
          { $set: Set2 },
          { $project: Project },
          { $sort: SortObject },
          { $skip: skip },
          { $limit: limit },
        ])
        .exec();
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async searchForSingleProduct(productId) {
    try {
      return await product.findById(productId);
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async createNewProduct(obj) {
    try {
      return await product.create(obj);
    } catch (error) {
      console.log(error);
      if (error instanceof CastError || error instanceof ValidationError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }

  async deleteSingleProduct(productId) {
    try {
      return await product.findOneAndDelete(
        { _id: productId },
        { returnDocument: 'after' }
      );
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async updateSingleProduct(productId, update) {
    const Filter = { _id: productId };
    const Options = { returnDocument: 'after', runValidators: true };

    try {
      return await product.findOneAndUpdate(Filter, update, Options);
    } catch (error) {
      console.log(error);
      if (error instanceof CastError || error instanceof ValidationError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }
}

module.exports = new ProductModel();
