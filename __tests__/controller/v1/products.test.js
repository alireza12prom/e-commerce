const {
  V1: { ProductController },
} = require('../../../server/controller').ApiController;

const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const {
  IntervalServerError,
  NotFoundError,
  BadRequestError,
} = require('../../../server/errors');

const { product } = require('../../../server/model/schema');

jest.mock('../../../server/model/schema/products.js');

const status = jest.fn((x) => ({ json: (x) => x }));

describe('test .getAll', () => {
  const request = { query: [{}, {}, {}] };
  const response = { status };

  it('shoud return 200 response if database return nothing', async () => {
    expect.assertions(1);

    product.aggregate.mockReturnValueOnce({ exec: () => [] });

    await ProductController.getAll(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud return 200 response if database return some data', async () => {
    expect.assertions(1);

    product.aggregate.mockReturnValueOnce({ exec: () => [] });

    await ProductController.getAll(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud throw IntervalServerError if database occurred error', async () => {
    expect.assertions(3);

    product.aggregate.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await ProductController.getAll(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
      expect(status).not.toHaveBeenCalled();
    }
    expect(status).not.toHaveBeenCalled();
  });
});

describe('test .getOne', () => {
  const request = { params: { productId: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if product not found', async () => {
    expect.assertions(2);

    product.findById.mockResolvedValueOnce(null);

    try {
      await ProductController.getOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.findById.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await ProductController.getOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    product.findById.mockResolvedValueOnce(true);

    await ProductController.getOne(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('test .createOne', () => {
  const request = { body: {} };
  const response = { status };

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await ProductController.createOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw CastError', async () => {
    expect.assertions(2);

    product.create.mockImplementationOnce(() => {
      throw new CastError();
    });

    try {
      await ProductController.createOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    product.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await ProductController.createOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    product.create.mockResolvedValueOnce(true);

    await ProductController.createOne(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .deleteOne', () => {
  const request = { user: { id: 1 }, body: { productId: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if product is not found', async () => {
    expect.assertions(2);

    product.findOneAndDelete.mockResolvedValueOnce(null);

    try {
      await ProductController.deleteOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.findOneAndDelete.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await ProductController.deleteOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    product.findOneAndDelete.mockResolvedValueOnce(true);

    await ProductController.deleteOne(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('test .updateOne', () => {
  const request = { body: { title: 'vivobook 3' }, params: { productId: 1 } };
  const response = { status };

  it('shoud throw BadRequestError if mongoose schema throw CastError', async () => {
    expect.assertions(2);

    product.findOneAndUpdate.mockImplementationOnce(() => {
      throw new CastError();
    });

    try {
      await ProductController.updateOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    product.findOneAndUpdate.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await ProductController.updateOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.findOneAndUpdate.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await ProductController.updateOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw NotFoundError if product not found', async () => {
    expect.assertions(2);
    product.findByIdAndDelete.mockResolvedValueOnce(null);

    try {
      await ProductController.updateOne(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    product.findOneAndUpdate.mockResolvedValueOnce(true);

    await ProductController.updateOne(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});
