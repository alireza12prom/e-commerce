const { response } = require('express');
const { StatusCodes } = require('http-status-codes');
const { CustomAPIErrors } = require('../errors');

const errorHandler = (error, request, response, next) => {
  if (error instanceof CustomAPIErrors) {
    response.status(error.statusCode).json({ msg: error.message });
  } else {
    response
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ msg: 'Server occurred error' });
  }
};

const allowedMethod = (allowedMethod) => {
  return (request, response, next) => {
    if (allowedMethod.includes(request.method)) return next();

    response.setHeader('Allow', allowedMethod.join(', '));
    throw new CustomAPIErrors(
      'method not allowed',
      StatusCodes.METHOD_NOT_ALLOWED
    );
  };
};

module.exports = { errorHandler, allowedMethod };
