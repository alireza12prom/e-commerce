const {
  V1: { FavoriteController },
} = require('../../../server/controller').ApiController;

const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const {
  IntervalServerError,
  NotFoundError,
  BadRequestError,
} = require('../../../server/errors');

const { product, favorite } = require('../../../server/model/schema');

jest.mock('../../../server/model/schema/products.js');
jest.mock('../../../server/model/schema/favorites.js');

const status = jest.fn((x) => ({ json: (x) => x }));

describe('test .getFavoritesList', () => {
  const request = { user: { id: 1 } };
  const response = { status };

  it('shoud return 200 response if database return nothing', async () => {
    expect.assertions(1);

    favorite.aggregate.mockReturnValueOnce({ exec: () => [] });

    await FavoriteController.getFavoritesList(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud return 200 response if database return some data', async () => {
    expect.assertions(1);

    favorite.aggregate.mockReturnValueOnce({ exec: () => [{}, {}] });

    await FavoriteController.getFavoritesList(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud throw IntervalServerError if database occurred error', async () => {
    expect.assertions(3);

    favorite.aggregate.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await FavoriteController.getFavoritesList(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
      expect(status).not.toHaveBeenCalled();
    }
    expect(status).not.toHaveBeenCalled();
  });
});

describe('test .saveToFavorites', () => {
  const request = { user: { id: 1 }, body: { productId: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if product not found', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(null);

    try {
      await FavoriteController.saveToFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema CastError', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);

    favorite.create.mockImplementationOnce(() => {
      throw new CastError();
    });

    try {
      await FavoriteController.saveToFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);

    favorite.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await FavoriteController.saveToFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if product already exists in favorites(mongoose throw error code 11000)', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);

    favorite.create.mockImplementationOnce(() => {
      throw { code: 11000 };
    });

    try {
      await FavoriteController.saveToFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);
    favorite.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await FavoriteController.saveToFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if everything was okey', async () => {
    expect.assertions(1);

    product.exists.mockResolvedValueOnce(true);
    favorite.create.mockResolvedValueOnce(true);

    await FavoriteController.saveToFavorites(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .dropFromFavorites', () => {
  const request = { user: { id: 1 }, body: { productId: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if product was not in the favorites', async () => {
    expect.assertions(2);

    favorite.findOneAndDelete.mockResolvedValueOnce(null);

    try {
      await FavoriteController.dropFromFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    favorite.findOneAndDelete.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await FavoriteController.dropFromFavorites(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    favorite.findOneAndDelete.mockResolvedValueOnce(true);

    await FavoriteController.dropFromFavorites(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});
