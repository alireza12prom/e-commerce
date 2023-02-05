const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const { DB_ERROR } = require('../errors');
const { commentFeedback, comment } = require('./schema');

class CommentFeedbackModel {
  constructor() {}

  async createFeedback(userId, obj) {
    try {
      return await commentFeedback.create({ userId, ...obj });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof CastError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else if (error.code === 11000) {
        throw DB_ERROR.DOCUMENT_EXISTS;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }

  async deleteFeedback(userId, commentId) {
    const Filter = { userId, commentId };
    const Options = { returnDocument: 'after' };

    try {
      return await commentFeedback.findOneAndDelete(Filter, Options);
    } catch (error) {
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }
}

module.exports = new CommentFeedbackModel();
