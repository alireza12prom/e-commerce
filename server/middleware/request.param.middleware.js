const { request, response } = require('express');
const { CustomAPIErrors } = require('../errors');

const {
  Types: { ObjectId },
} = require('mongoose');
const { StatusCodes } = require('http-status-codes');

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {callback} next
 */
const validateObjectId = (field) => {
  return (request, response, next) => {
    const { params } = request;

    if (!ObjectId.isValid(params[field]))
      throw new CustomAPIErrors(
        `${field} is not valid`,
        StatusCodes.BAD_REQUEST
      );

    params[field] = ObjectId(params[field]);
    next();
  };
};

module.exports = { validateObjectId };
