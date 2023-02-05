const { StatusCodes } = require('http-status-codes');
const { CustomAPIErrors } = require('./custom');

class BadRequestError extends CustomAPIErrors {
  constructor(message) {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

class IntervalServerError extends CustomAPIErrors {
  constructor(message) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR);
  }
}

class NotFoundError extends CustomAPIErrors {
  constructor(message) {
    super(message, StatusCodes.NOT_FOUND);
  }
}

class UnauthorizedError extends CustomAPIErrors {
  constructor(message) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

class ForbiddenError extends CustomAPIErrors {
  constructor(message) {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

module.exports = {
  BadRequestError,
  IntervalServerError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
};
