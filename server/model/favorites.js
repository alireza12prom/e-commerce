const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const { DB_ERROR } = require('../errors');
const { favorite } = require('./schema');

class FavoriteModel {
  constructor() {}

  async getFavorites(userId) {
    // lookup stage
    const Lookup = {
      from: 'products',
      localField: 'productId',
      foreignField: '_id',
      as: 'product',
    };
    // replaceRoot stage
    const ReplaceRoot = {
      newRoot: {
        $arrayElemAt: ['$product', 0],
      },
    };
    // project state
    const Project = {
      title: 1,
      model: 1,
      brand: 1,
      category: 1,
      price: 1,
      quentity: 1,
    };

    try {
      return await favorite
        .aggregate([
          { $match: { userId } },
          { $lookup: Lookup },
          { $replaceRoot: ReplaceRoot },
          { $project: Project },
        ])
        .exec();
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async saveToFavorites(userId, productId) {
    try {
      return await favorite.create({ userId, productId });
    } catch (error) {
      if (error instanceof CastError || error instanceof ValidationError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else if (error.code === 11000) {
        throw DB_ERROR.DOCUMENT_EXISTS;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }

  async dropFromFavorites(userId, productId) {
    const Filters = { userId, productId };
    const Options = { returnDocument: 'after' };

    try {
      return await favorite.findOneAndDelete(Filters, Options);
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new FavoriteModel(favorite);
