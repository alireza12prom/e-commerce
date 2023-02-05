const { CustomAPIErrors } = require('./custom');

module.exports = {
  CustomAPIErrors,
  DB_ERROR: require('./database.error.list'),
  ...require('./server.error.list'),
};
