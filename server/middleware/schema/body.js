const {
  Types: { ObjectId },
} = require('mongoose');

const Joi = require('joi');

module.exports = {
  feedbackSchema: Joi.object({
    feedback: Joi.string().trim().lowercase().valid('like', 'dislike'),
    commentId: Joi.string()
      .required()
      .custom(validateObjectId)
      .message('comment id is not valid'),
  }),
  commentSchema: Joi.object({
    title: Joi.string().trim().lowercase().min(5).max(20).default(null),
    score: Joi.alternatives(Joi.number().integer().min(1).max(5)).default(null),
    opinion: Joi.string()
      .trim()
      .lowercase()
      .min(5)
      .max(60)
      .empty()
      .default(null),
    productId: Joi.string()
      .trim()
      .required()
      .custom(validateObjectId)
      .message('product id is not valid'),
  }),
  discountSchema: Joi.object({
    expiretion: Joi.number().integer().min(1).required().custom(minuteToDate),
    percent: Joi.number().min(1).max(100).required(),
    products: Joi.array()
      .min(1)
      .custom(validateObjectId)
      .message('products id are not valid'),
  }),
  orderSchema: Joi.object({
    productId: Joi.string()
      .custom(validateObjectId)
      .message('Product id is not valid')
      .required(),
    n: Joi.alternatives().try(Joi.number().integer().min(1)).required(),
  }),
  productSchema: Joi.object({
    title: Joi.string().trim().lowercase().min(5).max(60).empty().default(null),
    brand: Joi.string().trim().lowercase().min(2).max(15).empty().default(null),
    models: Joi.string()
      .trim()
      .lowercase()
      .min(2)
      .max(15)
      .empty()
      .default(null),
    category: Joi.string()
      .trim()
      .lowercase()
      .min(2)
      .max(15)
      .empty()
      .default(null),
    description: Joi.string()
      .trim()
      .lowercase()
      .min(10)
      .max(140)
      .empty()
      .default(null),
    price: Joi.number().min(1).max(10_000_000).default(null),
    quentity: Joi.number().integer().min(1).max(1_000_000).default(null),
  }),
  userSchema: Joi.object({
    fname: Joi.string().trim().lowercase().min(3).max(15).required(),
    lname: Joi.string().trim().lowercase().min(3).max(15).required(),
    username: Joi.string().trim().min(6).max(20).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().trim().min(8).max(15),
    age: Joi.alternatives(Joi.number().integer().min(14).max(100)).required(),
  }),
  refreshTokenSchema: Joi.object({
    username: Joi.string().trim().required(),
    password: Joi.string().trim().required(),
  }),
};

function validateObjectId(value) {
  if (typeof value === 'string') {
    if (!ObjectId.isValid(value)) throw new Error();
    return ObjectId(value);
  }

  for (let i = 0; i < value.length; i++) {
    if (!ObjectId.isValid(value[i])) throw new Error();
    value[i] = ObjectId(value[i]);
  }
  return value;
}

function minuteToDate(v) {
  return new Date(Date.now() + v * 60 * 1000);
}
