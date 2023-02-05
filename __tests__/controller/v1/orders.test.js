const {
  V1: { OrderController },
} = require('../../../server/controller').ApiController;

const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const {
  IntervalServerError,
  NotFoundError,
  BadRequestError,
} = require('../../../server/errors');

const { order, product } = require('../../../server/model/schema');

jest.mock('../../../server/model/schema/orders.js');
jest.mock('../../../server/model/schema/products.js');

const status = jest.fn((x) => ({ json: (x) => x }));

describe('test .getOrdersList', () => {
  const request = { user: { id: 1 } };
  const response = { status };

  it('shoud return 200 response if database return nothing', async () => {
    expect.assertions(1);

    order.find.mockReturnValueOnce({ exec: () => [] });

    await OrderController.getOrdersList(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud return 200 response if database return some data', async () => {
    expect.assertions(1);

    order.find.mockReturnValueOnce({ exec: () => [{}, {}] });

    await OrderController.getOrdersList(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud throw IntervalServerError if database occurred error', async () => {
    expect.assertions(3);

    order.find.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await OrderController.getOrdersList(request, response);
    } catch (error) {
      console.log(error);
      expect(error).toBeInstanceOf(IntervalServerError);
      expect(status).not.toHaveBeenCalled();
    }
    expect(status).not.toHaveBeenCalled();
  });
});

describe('test .saveToOrders', () => {
  const request = { user: { id: 1 }, body: { productId: 1, n: 10 } };
  const response = { status };

  it('shoud throw NotFoundError if product not found', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(null);

    try {
      await OrderController.saveToOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw CastError', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);

    order.create.mockImplementationOnce(() => {
      throw new CastError();
    });

    try {
      await OrderController.saveToOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);

    order.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await OrderController.saveToOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if order already exists(mongoose throw error code 11000)', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);

    order.create.mockImplementationOnce(() => {
      throw { code: 11000 };
    });

    try {
      await OrderController.saveToOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);
    order.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await OrderController.saveToOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if everything was okey', async () => {
    expect.assertions(1);

    product.exists.mockResolvedValueOnce(true);
    order.create.mockResolvedValueOnce(true);

    await OrderController.saveToOrders(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .deleteFromOrdersList', () => {
  const request = { body: { productId: 1, userId: 1 }, user: { id: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if order not found', async () => {
    expect.assertions(2);

    order.findOneAndDelete.mockResolvedValueOnce(null);

    try {
      await OrderController.deleteFromOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    order.findOneAndDelete.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await OrderController.deleteFromOrders(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    order.findOneAndDelete.mockResolvedValueOnce(true);

    await OrderController.deleteFromOrders(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});
