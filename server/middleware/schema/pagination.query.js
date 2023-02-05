const Joi = require('joi');

module.exports = {
  paginationSchema: Joi.object({
    page: Joi.alternatives().try(Joi.number().min(1)).default(1),
    limit: Joi.alternatives().try(Joi.number().min(5)).default(25),
  }),
};
