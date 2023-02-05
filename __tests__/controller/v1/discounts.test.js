const {
  V1: { DiscountController },
} = require('../../../server/controller').ApiController;

const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const {
  IntervalServerError,
  NotFoundError,
  BadRequestError,
} = require('../../../server/errors');

const { product, discount } = require('../../../server/model/schema');

jest.mock('../../../server/model/schema/products.js');
jest.mock('../../../server/model/schema/discounts.js');

const status = jest.fn((x) => ({ json: (x) => x }));

describe('test .getDiscounts', () => {
  const request = {};
  const response = { status };

  it('shoud return 200 response if database return nothing', async () => {
    expect.assertions(1);

    discount.aggregate.mockReturnValueOnce({ exec: () => [] });

    await DiscountController.getDiscounts(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud return 200 response if database return some data', async () => {
    expect.assertions(1);

    discount.aggregate.mockReturnValueOnce({ exec: () => [{}, {}] });

    await DiscountController.getDiscounts(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    discount.aggregate.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await DiscountController.getDiscounts(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });
});

describe('test .addDiscount', () => {
  const request = { body: { products: [1, 2, 3], percent: 1, expiretion: 2 } };
  const response = { status };

  it('shoud throw BadRequestError if one of the products id is not found', async () => {
    expect.assertions(2);

    product.find.mockImplementationOnce(() => ({ exec: () => [] }));

    try {
      await DiscountController.addDiscount(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw CastError', async () => {
    expect.assertions(2);

    product.find.mockImplementationOnce(() => ({ exec: () => [1, 2, 3] }));
    discount.create.mockImplementationOnce(() => {
      throw new CastError();
    });

    try {
      await DiscountController.addDiscount(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalledWith();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    product.find.mockImplementationOnce(() => ({ exec: () => [1, 2, 3] }));

    discount.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await DiscountController.addDiscount(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalledWith();
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.find.mockImplementationOnce(() => ({ exec: () => [1, 2, 3] }));
    discount.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await DiscountController.addDiscount(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if everything was okey', async () => {
    expect.assertions(1);

    product.find.mockImplementationOnce(() => ({ exec: () => [1, 2, 3] }));
    discount.create.mockResolvedValueOnce(true);
    product.updateMany.mockResolvedValueOnce(true);

    await DiscountController.addDiscount(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .expireDiscount', () => {
  const request = { body: { discountId: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if discount is not found', async () => {
    expect.assertions(2);
    discount.findByIdAndDelete.mockResolvedValueOnce(null);

    try {
      await DiscountController.expireDiscount(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);
    discount.findByIdAndDelete.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await DiscountController.expireDiscount(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);
    discount.findByIdAndDelete.mockResolvedValueOnce(true);

    await DiscountController.expireDiscount(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});
