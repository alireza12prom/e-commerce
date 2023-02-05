const { filterSchema } = require('./filter.query');
const { paginationSchema } = require('./pagination.query');
const { sortSchema } = require('./sort.query');

module.exports = {
  filterSchema,
  paginationSchema,
  sortSchema,
  ...require('./body'),
};
