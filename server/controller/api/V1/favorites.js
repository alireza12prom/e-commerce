'use strict';

const {
  DB_ERROR,
  IntervalServerError,
  BadRequestError,
  CustomAPIErrors,
  NotFoundError,
} = require('../../../errors');

const { StatusCodes } = require('http-status-codes');
const { Favorite } = require('../../../model');
const { product } = require('../../../model/schema');

class FavoriteController {
  constructor() {}

  async getFavoritesList(request, response) {
    const { id } = request.user;

    try {
      const result = await Favorite.getFavorites(id);

      const ResponseObject = { n: result.length, favorites: result };
      response.status(StatusCodes.OK).json(ResponseObject);
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async saveToFavorites(request, response) {
    const {
      body: { productId },
      user: { id },
    } = request;

    try {
      const exists = await product.exists({ _id: productId });
      if (!exists) throw new NotFoundError('Product not found');

      await Favorite.saveToFavorites(id, productId);
      response.status(StatusCodes.CREATED).json({ msg: 'OK' });
    } catch (error) {
      if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs are not valid');
      } else if (error === DB_ERROR.DOCUMENT_EXISTS) {
        throw new BadRequestError(
          'You have already added this product to your favorites'
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

  async dropFromFavorites(request, response) {
    const {
      body: { productId },
      user: { id },
    } = request;

    try {
      const result = await Favorite.dropFromFavorites(id, productId);
      if (!result) throw new NotFoundError('Product is not in your favorites');

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

module.exports = new FavoriteController();
