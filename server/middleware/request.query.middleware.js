const Joi = require('joi');
const { StatusCodes } = require('http-status-codes');

const { filterSchema, paginationSchema, sortSchema } = require('./schema');

const ValidatequeriesOnGetAllProducts = (request, response, next) => {
  /**
   * pagination
   *      accept query: [page, limit]
   *
   * NOTE: by default limit is 25 & page is 1
   */
  const { page, limit } = request.query;
  const { error: e1, value: PaginationObject } = paginationSchema.validate({
    page,
    limit,
  });
  if (e1)
    return response
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: e1.details[0].message });

  /**
   * filter
   *      accept query: [category, price_s, price_e, brand]
   * NOTE: category is required
   */
  const { category, price_s, price_e, brand } = request.query;
  const { error: e2, value: FilterObject } = filterSchema.validate({
    category,
    price_s,
    price_e,
    brand,
  });
  if (e2)
    return response
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: e2.details[0].message });

  /**
   * sort
   *    accept query: [price, like, rate]
   * NOTE: by default sort is by rate(desc)
   */
  const { price, likes, rate } = request.query;
  const { error: er3, value: SortObject } = sortSchema.validate({
    price,
    likes,
    rate,
  });
  if (er3)
    return response
      .status(StatusCodes.BAD_REQUEST)
      .json({ msg: e2.details[0].message });

  request.query = [FilterObject, PaginationObject, SortObject];
  next();
};

module.exports = {
  ValidatequeriesOnGetAllProducts,
};
