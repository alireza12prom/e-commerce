'use strict';

const {
  CustomAPIErrors,
  NotFoundError,
  DB_ERROR,
  BadRequestError,
  IntervalServerError,
} = require('../../../errors');

const { Product } = require('../../../model');
const { StatusCodes } = require('http-status-codes');

class ProductsController {
  constructor() {}

  async getAll(request, response) {
    const { query } = request;

    try {
      console.log(query);
      const products = await Product.getProducts(...query);

      const ResponseObject = { n: products.length, products };
      response.status(StatusCodes.OK).json(ResponseObject);
    } catch (error) {
      console.log(error);
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async getOne(request, response) {
    const { productId } = request.params;

    try {
      const product = await Product.searchForSingleProduct(productId);
      if (!product) throw new NotFoundError('Product not found');
      response.status(StatusCodes.OK).json({ product });
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

  async createOne(request, response) {
    const { body } = request;

    try {
      const result = await Product.createNewProduct(body);
      response.status(StatusCodes.CREATED).json({ product: result });
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs are not valid');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async deleteOne(request, response) {
    const { productId } = request.body;

    try {
      const result = await Product.deleteSingleProduct(productId);
      if (!result) throw new NotFoundError('Product not found');
      response.status(StatusCodes.OK).json({ product: result });
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

  async updateOne(request, response) {
    const {
      body,
      params: { productId },
    } = request;

    try {
      const result = await Product.updateSingleProduct(productId, body);
      if (!result) throw new NotFoundError('Product not found');
      response.status(StatusCodes.OK).json({ product: result });
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
}

module.exports = new ProductsController();
