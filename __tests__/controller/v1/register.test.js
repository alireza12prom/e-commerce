const {
  V1: { RegisterController },
} = require('../../../server/controller').ApiController;

const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const {
  IntervalServerError,
  BadRequestError,
  UnauthorizedError,
} = require('../../../server/errors');

const { HashService } = require('../../../server/service');
const { getTimestampAfterNHour } = require('../../../server/utils');
const {
  user,
  admins,
  blockedUsers,
  apikeys,
} = require('../../../server/model/schema');
const { comparePassword } = require('../../../server/service/encrypt.service');

jest.mock('../../../server/model/schema/admins.js');
jest.mock('../../../server/model/schema/users.js');
jest.mock('../../../server/model/schema/blocked.user.js');
jest.mock('../../../server/model/schema/apikeys.js');
jest.mock('../../../server/model/schema/admins.js');
jest.mock('../../../server/service/encrypt.service.js');
jest.mock('../../../server/utils/date.js');

const status = jest.fn((x) => ({ json: (x) => x }));

describe('test .register', () => {
  const request = { body: {} };
  const response = { status };

  beforeEach(() => {
    HashService.hashPassword.mockImplementationOnce(() => true);
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    user.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await RegisterController.register(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw CastError', async () => {
    expect.assertions(2);

    user.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await RegisterController.register(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    user.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await RegisterController.register(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if user already exists(mongoose throw error code 11000)', async () => {
    expect.assertions(2);

    user.create.mockImplementationOnce(() => {
      throw { code: 11000 };
    });

    try {
      await RegisterController.register(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if everything was okey', async () => {
    expect.assertions(1);
    user.create.mockResolvedValueOnce(true);

    await RegisterController.register(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .refreshApikey', () => {
  const request = { body: {} };
  const response = { status };

  it('shoud throw UnauthorizedError if client was not in users and admins', async () => {
    expect.assertions(2);
    user.findOne.mockResolvedValueOnce(null);
    admins.findOne.mockResolvedValueOnce(null);

    try {
      await RegisterController.refreshApikey(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw UnauthorizedError if client was a user but password was wrong', async () => {
    expect.assertions(2);
    user.findOne.mockResolvedValueOnce({});
    admins.findOne.mockResolvedValueOnce(null);
    comparePassword.mockReturnValueOnce(false);

    try {
      await RegisterController.refreshApikey(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if client was a user and it was in blocked users', async () => {
    expect.assertions(2);
    user.findOne.mockResolvedValueOnce({ as: 'USER' });
    admins.findOne.mockResolvedValueOnce(null);
    comparePassword.mockReturnValueOnce(true);
    blockedUsers.exists.mockResolvedValueOnce(true);

    try {
      await RegisterController.refreshApikey(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if client was a user and the user hash no any apikey', async () => {
    expect.assertions(2);

    user.findOne.mockResolvedValueOnce({ as: 'USER' });
    admins.findOne.mockResolvedValueOnce(null);
    comparePassword.mockReturnValueOnce(true);
    blockedUsers.exists.mockResolvedValueOnce(false);
    HashService.genApiKey.mockReturnValueOnce('');
    getTimestampAfterNHour.mockReturnValueOnce(0);
    apikeys.findOne.mockResolvedValueOnce(false);
    apikeys.create.mockResolvedValueOnce(true);

    await RegisterController.refreshApikey(request, response);
    expect(status).toHaveBeenCalledWith(201);
    expect(blockedUsers.exists).toHaveBeenCalled();
  });

  it('shoud return 201 response if client was a user and the user hash already apikey', async () => {
    expect.assertions(5);

    const fakeDoc = { apikey: 1, expire_at: 1, save: jest.fn((x) => x) };
    const newApikey = '123123';
    const newExpiretion = 1111;

    user.findOne.mockResolvedValueOnce({ as: 'USER' });
    admins.findOne.mockResolvedValueOnce(null);
    comparePassword.mockReturnValueOnce(true);
    blockedUsers.exists.mockResolvedValueOnce(false);
    HashService.genApiKey.mockReturnValueOnce(newApikey);
    getTimestampAfterNHour.mockReturnValueOnce(newExpiretion);
    apikeys.findOne.mockResolvedValueOnce(fakeDoc);
    apikeys.create.mockResolvedValueOnce(true);

    await RegisterController.refreshApikey(request, response);
    expect(status).toHaveBeenCalledWith(201);
    expect(blockedUsers.exists).toHaveBeenCalled();
    expect(fakeDoc.apikey).toBe(newApikey);
    expect(fakeDoc.expire_at).toBe(newExpiretion);
    expect(fakeDoc.save).toHaveBeenCalled();
  });

  it('shoud UnauthorizedError if client was an admin but password was wrong', async () => {
    expect.assertions(2);
    user.findOne.mockResolvedValueOnce(null);
    admins.findOne.mockResolvedValueOnce({});
    comparePassword.mockReturnValueOnce(false);

    try {
      await RegisterController.refreshApikey(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(UnauthorizedError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if client was an admin and the admin hash no any apikey', async () => {
    expect.assertions(2);

    user.findOne.mockResolvedValueOnce(null);
    admins.findOne.mockResolvedValueOnce({ as: 'ADMIN' });
    comparePassword.mockReturnValueOnce(true);
    HashService.genApiKey.mockReturnValueOnce('');
    getTimestampAfterNHour.mockReturnValueOnce(0);
    apikeys.findOne.mockResolvedValueOnce(false);
    apikeys.create.mockResolvedValueOnce(true);

    await RegisterController.refreshApikey(request, response);
    expect(status).toHaveBeenCalledWith(201);
    expect(blockedUsers.exists).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if client was an admin and the admin hash already apikey', async () => {
    expect.assertions(5);

    const fakeDoc = { apikey: 1, expire_at: 1, save: jest.fn((x) => x) };
    const newApikey = '123123';
    const newExpiretion = 1111;

    user.findOne.mockResolvedValueOnce(null);
    admins.findOne.mockResolvedValueOnce({ as: 'ADMIN' });
    comparePassword.mockReturnValueOnce(true);
    HashService.genApiKey.mockReturnValueOnce(newApikey);
    getTimestampAfterNHour.mockReturnValueOnce(newExpiretion);
    apikeys.findOne.mockResolvedValueOnce(fakeDoc);
    apikeys.create.mockResolvedValueOnce(true);

    await RegisterController.refreshApikey(request, response);
    expect(status).toHaveBeenCalledWith(201);
    expect(blockedUsers.exists).not.toHaveBeenCalled();
    expect(fakeDoc.apikey).toBe(newApikey);
    expect(fakeDoc.expire_at).toBe(newExpiretion);
    expect(fakeDoc.save).toHaveBeenCalled();
  });
});
