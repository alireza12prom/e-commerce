const {
  UnauthorizedError,
  IntervalServerError,
  CustomAPIErrors,
  BadRequestError,
  ForbiddenError,
} = require('../errors');

const { request, response } = require('express'),
  { Apikey, BlockedUser } = require('../model'),
  MAX_REQUEST = process.env.MAX_REQUEST,
  API_EXPIRE_AT = process.env.API_EXPIRE_AT;

/**
 *
 * @param {request} request
 * @param {response} response
 * @param {callback} next
 */
const authenticationUser = async (request, response, next) => {
  try {
    const apikey = request.header('x-api-key');
    if (!apikey) throw new UnauthorizedError('`x-api-key` is required');

    const result = await Apikey.findUserByApikey(apikey);
    if (!result) {
      throw new UnauthorizedError('Your apikey is fake!');
    } else if (result.as === 'USER') {
      if (result.requests > MAX_REQUEST) {
        await BlockedUser.newUser(result.userId, result.expire_at);
        await Apikey.dropApikey(result.userId);
        throw new BadRequestError(
          `You can send ${MAX_REQUEST} per ${API_EXPIRE_AT} hr`
        );
      } else {
        await result.$inc('requests', 1).save();
      }
    }

    request.user = { id: result.userId, as: result.as };
    next();
  } catch (error) {
    console.log(error);
    if (error instanceof CustomAPIErrors) {
      throw error;
    } else {
      throw new IntervalServerError(
        'Somethign went wrong while authentication'
      );
    }
  }
};

/**
 *
 * @param {String} role must be one of the `user` or `admin`
 * @returns
 */
const hashRole = (role) => {
  return (request, response, next) => {
    const { as } = request.user;
    if (as.toUpperCase() === role.toUpperCase()) return next();
    throw new ForbiddenError("You can't access to this resource");
  };
};

module.exports = { authenticationUser, hashRole };
