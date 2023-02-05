const {
  V1: { CommentController },
} = require('../../../server/controller').ApiController;

const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const {
  IntervalServerError,
  NotFoundError,
  BadRequestError,
} = require('../../../server/errors');

const {
  product,
  comment,
  commentFeedback,
} = require('../../../server/model/schema');

jest.mock('../../../server/model/schema/products.js');
jest.mock('../../../server/model/schema/comments.js');
jest.mock('../../../server/model/schema/comment.feedback.js');

const status = jest.fn((x) => ({ json: (x) => x }));

describe('test .getComments', () => {
  const request = { params: 1 };
  const response = { status };

  it('shoud return 200 response if db return nothing', async () => {
    expect.assertions(1);

    comment.aggregate.mockReturnValueOnce({ exec: () => [] });

    await CommentController.getComments(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud return 200 response if db return some data', async () => {
    expect.assertions(1);

    comment.aggregate.mockReturnValueOnce({ exec: () => [{}, {}] });

    await CommentController.getComments(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });

  it('shoud throw IntervalServerError if db occurred error', async () => {
    expect.assertions(3);

    comment.aggregate.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await CommentController.getComments(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
      expect(status).not.toHaveBeenCalled();
    }
    expect(status).not.toHaveBeenCalled();
  });
});

describe('test .sendAComment', () => {
  const request = { body: { productId: 1 }, user: { id: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if product not found', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(null);

    try {
      await CommentController.sendAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw ValidationError', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);
    comment.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await CommentController.sendAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if mongoose schema throw CastError', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);
    comment.create.mockImplementationOnce(() => {
      throw new CastError();
    });

    try {
      await CommentController.sendAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if user already sent comment(mongoose throw error code 11000)', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);
    comment.create.mockImplementationOnce(() => {
      throw { code: 11000 };
    });

    try {
      await CommentController.sendAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw IntervalServerError if database throw an unknown error', async () => {
    expect.assertions(2);

    product.exists.mockResolvedValueOnce(true);
    comment.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await CommentController.sendAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if everything was okey', async () => {
    expect.assertions(1);

    product.exists.mockResolvedValueOnce(true);
    comment.create.mockResolvedValueOnce(true);

    await CommentController.sendAComment(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .deleteAComment', () => {
  const request = { body: { productId: 1, userId: 1 }, user: { id: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if comment not found', async () => {
    expect.assertions(2);

    comment.findOneAndDelete.mockResolvedValueOnce(null);

    try {
      await CommentController.deleteAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if db throw an unknown error', async () => {
    expect.assertions(2);

    comment.findOneAndDelete.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await CommentController.deleteAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    comment.findOneAndDelete.mockResolvedValueOnce(true);

    await CommentController.deleteAComment(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('test .updateComment', () => {
  const request = { body: { productId: 1, title: 'test' }, user: { id: 1 } };
  const response = { status };

  it('shoud throw BadRequestError if db throw `ValidationError` or `CastError`', async () => {
    expect.assertions(3);

    comment.findOneAndUpdate.mockImplementationOnce(() => {
      throw new CastError();
    });

    comment.findOneAndUpdate.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await CommentController.updateAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }

    try {
      await CommentController.updateAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if db throw an unknown error', async () => {
    expect.assertions(2);

    comment.findOneAndUpdate.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await CommentController.updateAComment(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);

    comment.findOneAndUpdate.mockResolvedValueOnce(true);

    await CommentController.updateAComment(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});

describe('test .sendFeedback', () => {
  const request = { body: { commentId: 1, feedback: 'like' }, user: { id: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if comment not found', async () => {
    expect.assertions(2);

    comment.exists.mockResolvedValueOnce(null);

    try {
      await CommentController.sendFeedback(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if db throw `ValidationError` or `CastError`', async () => {
    expect.assertions(3);

    comment.exists.mockResolvedValueOnce(true);
    comment.exists.mockResolvedValueOnce(true);

    commentFeedback.create.mockImplementationOnce(() => {
      throw new CastError();
    });

    commentFeedback.create.mockImplementationOnce(() => {
      throw new ValidationError();
    });

    try {
      await CommentController.sendFeedback(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }

    try {
      await CommentController.sendFeedback(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw BadRequestError if user already sent feedback(mongoose throw error code 11000)', async () => {
    expect.assertions(2);

    comment.exists.mockResolvedValueOnce(true);
    commentFeedback.create.mockImplementationOnce(() => {
      throw { code: 11000 };
    });

    try {
      await CommentController.sendFeedback(request, response);
    } catch (error) {
      console.log(error);
      expect(error).toBeInstanceOf(BadRequestError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw IntervalServerError if db throw an unknown error', async () => {
    expect.assertions(2);

    comment.exists.mockResolvedValueOnce(true);
    commentFeedback.create.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await CommentController.sendFeedback(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 201 response if everything was okey', async () => {
    expect.assertions(1);

    product.exists.mockResolvedValueOnce(true);
    commentFeedback.create.mockResolvedValueOnce(true);

    await CommentController.sendAComment(request, response);
    expect(status).toHaveBeenCalledWith(201);
  });
});

describe('test .deleteFeedback', () => {
  const request = { body: { commentId: 1 }, user: { id: 1 } };
  const response = { status };

  it('shoud throw NotFoundError if comment not found', async () => {
    expect.assertions(2);
    commentFeedback.findOneAndDelete.mockResolvedValueOnce(null);

    try {
      await CommentController.deleteFeedback(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(NotFoundError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud throw InternalServerError if database throw an unknown error', async () => {
    expect.assertions(2);
    commentFeedback.findOneAndDelete.mockImplementationOnce(() => {
      throw new Error();
    });

    try {
      await CommentController.deleteFeedback(request, response);
    } catch (error) {
      expect(error).toBeInstanceOf(IntervalServerError);
    }
    expect(status).not.toHaveBeenCalled();
  });

  it('shoud return 200 response if everything was okey', async () => {
    expect.assertions(1);
    commentFeedback.findOneAndDelete.mockResolvedValueOnce(true);

    await CommentController.deleteFeedback(request, response);
    expect(status).toHaveBeenCalledWith(200);
  });
});
