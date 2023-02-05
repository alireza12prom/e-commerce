const Joi = require('joi');

module.exports = {
  sortSchema: Joi.object({
    price: Joi.alternatives().try(Joi.number().valid(1, -1)).default(null),
    rate: Joi.alternatives().try(Joi.number().valid(1, -1)).default(-1),
    likes: Joi.alternatives().try(Joi.number().valid(1, -1)).default(null),
  }),
};
