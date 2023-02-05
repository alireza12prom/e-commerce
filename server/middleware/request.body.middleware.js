const { response, request } = require('express');
const { BadRequestError } = require('../errors');
const { StatusCodes } = require('http-status-codes');

const {
  Types: { ObjectId },
} = require('mongoose');
const {
  feedbackSchema,
  discountSchema,
  commentSchema,
  orderSchema,
  productSchema,
  userSchema,
  refreshTokenSchema,
} = require('./schema');
const { order } = require('../model/schema');

/**
 *
 * @param {array} fields
 */
const validateObjectId = (fields) => {
  return (request, response, next) => {
    const { body } = request;

    for (f of fields) {
      if (!ObjectId.isValid(body[f])) {
        throw new BadRequestError(`${f} is not valid`);
      } else {
        body[f] = ObjectId(body[f]);
      }
    }
    next();
  };
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnSendCommentFeedback = (request, response, next) => {
  const { commentId, feedback } = request.body;

  const { error, value } = feedbackSchema.validate({ commentId, feedback });
  if (error) throw new BadRequestError(error.details[0].message);

  request.body = value;
  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnAddDiscount = (request, response, next) => {
  const { products, expiretion, percent } = request.body;

  /**
   * NOTE: expiretion unite is minutes
   */
  const { value, error } = discountSchema.validate({
    products,
    expiretion,
    percent,
  });

  if (error) throw new BadRequestError(error.details[0].message);

  request.body = value;
  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnNewComment = (request, response, next) => {
  const { title, opinion, score, productId } = request.body;

  const { error, value } = commentSchema.validate({
    title,
    opinion,
    score,
    productId,
  });

  if (error) {
    throw new BadRequestError(error.details[0].message);
  } else if (Object.values(value).filter((v) => v === null).length) {
    throw new BadRequestError(
      '[title, opinion, score, productId] are required'
    );
  }

  request.body = value;
  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnUpdateComment = (request, response, next) => {
  const { title, opinion, score, productId } = request.body;

  const { value, error } = commentSchema.validate({
    title,
    opinion,
    score,
    productId,
  });

  if (error) {
    throw new BadRequestError(error.details[0].message);
  } else if (Object.values(value).filter((v) => v === null).length === 3) {
    throw new BadRequestError('Please specify at least one field to update');
  }

  for (f of Object.keys(value)) {
    if (value[f]) request.body[f] = value[f];
    else request.body[f] = undefined;
  }

  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnNewOrder = (request, response, next) => {
  const { productId, n } = request.body;

  const { error, value } = orderSchema.validate({ productId, n });
  if (error) throw new BadRequestError(error.details[0].message);

  request.body = value;
  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnNewProduct = (request, response, next) => {
  const { title, brand, models, category, description, price, quentity } =
    request.body;

  const { error, value } = productSchema.validate({
    title,
    brand,
    models,
    category,
    description,
    price,
    quentity,
  });

  if (error) {
    throw new BadRequestError(error.details[0].message);
  } else if (Object.values(value).filter((v) => v === null).length) {
    throw new BadRequestError(
      `[title, brand, models, category, description, price, quentity] are required`
    );
  }

  request.body = value;
  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnUpdateProduct = (request, response, next) => {
  const { title, brand, models, category, description, price, quentity } =
    request.body;

  const { error, value } = productSchema.validate({
    title,
    brand,
    models,
    category,
    description,
    price,
    quentity,
  });

  if (error) {
    throw new BadRequestError(error.details[0].message);
  } else if (Object.values(value).filter((v) => v === null).length === 7) {
    throw new BadRequestError(`please specify at lease one field to update`);
  }

  for (f of Object.keys(value)) {
    if (value[f]) request.body[f] = value[f];
    else request.body[f] = undefined;
  }

  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnRegisterUser = (request, response, next) => {
  const { fname, lname, age, username, password, email } = request.body;

  const { error, value } = userSchema.validate({
    fname,
    lname,
    age,
    username,
    password,
    email,
  });
  if (error) throw new BadRequestError(error.details[0].message);

  request.body = value;
  next();
};

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {function} next
 */
const validateBodyOnGetNewApiKey = (request, response, next) => {
  const { username, password } = request.body;

  const { error, value } = refreshTokenSchema.validate({
    username,
    password,
  });
  if (error) throw new BadRequestError(error.details[0].message);

  request.body = value;
  next();
};

module.exports = {
  validateObjectId,
  validateBodyOnSendCommentFeedback,
  validateBodyOnAddDiscount,
  validateBodyOnNewComment,
  validateBodyOnUpdateComment,
  validateBodyOnNewOrder,
  validateBodyOnNewProduct,
  validateBodyOnUpdateProduct,
  validateBodyOnRegisterUser,
  validateBodyOnGetNewApiKey,
};
