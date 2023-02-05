const Joi = require('joi');

module.exports = {
  filterSchema: Joi.object({
    category: Joi.string().trim().lowercase().required(),
    brand: Joi.string().trim().lowercase().default(null),
    price_s: Joi.alternatives().try(Joi.number().min(0)).default(0),
    price_e: Joi.alternatives()
      .try(Joi.number().greater(Joi.ref('price_s')))
      .default(null),
  }),
};
