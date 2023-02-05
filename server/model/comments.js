const {
  Error: { CastError, ValidationError },
} = require('mongoose');

const { DB_ERROR } = require('../errors');
const { comment } = require('./schema');

class CommentModel {
  constructor() {}

  async searchProductComments(productId) {
    // lookup stage
    const Lookup1 = {
      from: 'comment_feedbacks',
      localField: '_id',
      foreignField: 'commentId',
      as: 'feedbacks',
    };

    const Lookup2 = {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    };

    // set stages
    const Set = {
      likes: {
        $size: {
          $filter: {
            input: '$feedbacks',
            as: 'item',
            cond: { $eq: ['like', '$$item.feedback'] },
          },
        },
      },
      dislikes: {
        $size: {
          $filter: {
            input: '$feedbacks',
            as: 'item',
            cond: { $eq: ['dislike', '$$item.feedback'] },
          },
        },
      },
      user: {
        $arrayElemAt: ['$user', 0],
      },
    };

    // group stage
    const Group = {
      _id: '$_id',
      title: { $first: '$title' },
      email: { $first: '$user.email' },
      opinion: { $first: '$opinion' },
      feedbacks: {
        $first: {
          likes: '$likes',
          dislikes: '$dislikes',
        },
      },
    };

    try {
      return await comment
        .aggregate([
          { $match: { productId } },
          { $lookup: Lookup1 },
          { $lookup: Lookup2 },
          { $set: Set },
          { $group: Group },
        ])
        .exec();
    } catch (error) {
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async sendComment(userId, obj) {
    console.log({ userId, ...obj });
    try {
      return await comment.create({ userId, ...obj });
    } catch (error) {
      if (error instanceof CastError || error instanceof ValidationError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else if (error.code === 11000) {
        throw DB_ERROR.DOCUMENT_EXISTS;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }

  async deleteComment(productId, userId) {
    const Filter = { productId, userId };
    const Options = { returnDocument: 'after' };

    try {
      return await comment.findOneAndDelete(Filter, Options);
    } catch (error) {
      console.log(error);
      throw DB_ERROR.UNKNOWN_ERROR;
    }
  }

  async updateComment(productId, userId, obj) {
    const Filter = { productId, userId };
    const Options = { returnDocument: 'after', runValidators: true };

    try {
      return await comment.findOneAndUpdate(Filter, obj, Options);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof CastError) {
        throw DB_ERROR.SCHEMA_VALIDATOR;
      } else {
        throw DB_ERROR.UNKNOWN_ERROR;
      }
    }
  }
}

module.exports = new CommentModel();
