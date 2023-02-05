const {
  DB_ERROR,
  IntervalServerError,
  BadRequestError,
  CustomAPIErrors,
  UnauthorizedError,
} = require('../../../errors');

const { StatusCodes } = require('http-status-codes');
const { User, Apikey, BlockedUser, Admin } = require('../../../model');
const { HashService } = require('../../../service');
const { getTimestampAfterNHour } = require('../../../utils');

class RegisterationController {
  constructor() {}

  async register(request, response) {
    const { body } = request;

    // hashing password
    body.password = HashService.hashPassword(body.password);

    try {
      await User.newUser(body);
      response.status(StatusCodes.CREATED).json({ msg: 'OK' });
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error === DB_ERROR.DOCUMENT_EXISTS) {
        throw new BadRequestError('Duplicate email or username');
      } else if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs are not valid');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async refreshApikey(request, response) {
    const { username, password } = request.body;

    try {
      // authenticate user
      const [user, admin] = await Promise.all([
        User.findUser(username),
        Admin.findAdmin(username),
      ]);

      if (!user && !admin) throw new UnauthorizedError('User not found');

      const target = user ? user : admin;
      const isMatch = HashService.comparePassword(password, target.password);
      if (!isMatch) {
        throw new UnauthorizedError('Password is wrong');
      }

      // check the user requests have reached the limit
      if (target.as.toUpperCase() === 'USER') {
        if (await BlockedUser.isBlockedUser(target._id)) {
          throw new BadRequestError('Your requests have reached the limit');
        }
      }

      // generate new apikey ans save it in db
      const apikey = HashService.genApiKey();
      const expire_at = getTimestampAfterNHour(process.env.API_EXPIRE_AT);

      const result = await Apikey.findUserById(target._id);
      if (result) {
        result.apikey = apikey;
        result.expire_at = expire_at;
        await result.save();
      } else {
        await Apikey.newApikey(target._id, apikey, expire_at, target.as);
      }

      response.status(StatusCodes.CREATED).json({ apikey });
    } catch (error) {
      if (error instanceof CustomAPIErrors) {
        throw error;
      } else if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new IntervalServerError(
          'Somethign went wrong when updating apikey'
        );
      } else if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }
}

module.exports = new RegisterationController();
