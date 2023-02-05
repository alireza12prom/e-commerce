'use strict';

const {
  DB_ERROR,
  IntervalServerError,
  BadRequestError,
  NotFoundError,
  CustomAPIErrors,
} = require('../../../errors');

const { StatusCodes } = require('http-status-codes');
const { Comment, CommentFeedback } = require('../../../model');
const { product, comment } = require('../../../model/schema');

class CommentController {
  constructor() {}

  async getComments(request, response) {
    const { productId } = request.params;

    try {
      const result = await Comment.searchProductComments(productId);

      const ResponseObject = { n: result.length, comments: result };
      response.status(StatusCodes.OK).json(ResponseObject);
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async sendAComment(request, response) {
    const {
      body,
      user: { id },
    } = request;

    try {
      const exists = await product.exists({ _id: body.productId });
      if (!exists) throw new NotFoundError('Product not found');

      const result = await Comment.sendComment(id, body);
      response.status(StatusCodes.CREATED).json({ comment: result });
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Input is not valid');
      } else if (error === DB_ERROR.DOCUMENT_EXISTS) {
        throw new BadRequestError('You have already sent comment');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async deleteAComment(request, response) {
    const {
      body: { productId },
      user: { id },
    } = request;

    try {
      const result = await Comment.deleteComment(productId, id);
      if (!result) throw new NotFoundError('Comment not found');

      response.status(StatusCodes.OK).json({ comment: result });
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async updateAComment(request, response) {
    const {
      body: { productId, opinion, title, score },
      user: { id },
    } = request;

    try {
      const result = await Comment.updateComment(productId, id, {
        opinion,
        title,
        score,
      });

      if (!result) throw new NotFoundError('Comment not found');

      response.status(StatusCodes.OK).json({ comment: result });
    } catch (error) {
      if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs are not valid');
      } else if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async sendFeedback(request, response) {
    const {
      body,
      user: { id },
    } = request;

    try {
      const exists = await comment.exists({ _id: body.commentId });
      if (!exists) throw new NotFoundError('Comment not found');

      await CommentFeedback.createFeedback(id, body);
      response.status(StatusCodes.CREATED).json({ msg: 'OK' });
    } catch (error) {
      if (error === DB_ERROR.SCHEMA_VALIDATOR) {
        throw new BadRequestError('Inputs is not valid');
      } else if (error === DB_ERROR.DOCUMENT_EXISTS) {
        throw new BadRequestError('You have already sent feedback');
      } else if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }

  async deleteFeedback(request, response) {
    const {
      body: { commentId },
      user: { id },
    } = request;

    try {
      const result = await CommentFeedback.deleteFeedback(id, commentId);
      if (!result) throw new NotFoundError('You have no feedback');

      response.status(StatusCodes.OK).json({ msg: 'OK' });
    } catch (error) {
      if (error === DB_ERROR.UNKNOWN_ERROR) {
        throw new IntervalServerError('Database occurred error');
      } else if (error instanceof CustomAPIErrors) {
        throw error;
      } else {
        throw new IntervalServerError('Server occurred error');
      }
    }
  }
}

module.exports = new CommentController();
