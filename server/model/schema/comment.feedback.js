const { Schema, model } = require('mongoose');

const schema = new Schema({
  commentId: {
    type: Schema.Types.ObjectId,
    required: [true, 'commentId is required'],
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: [true, 'userId is required'],
  },
  feedback: {
    type: Schema.Types.String,
    required: [true, 'feedback must be specify'],
    enum: {
      values: ['like', 'dislike'],
      message: 'feedback must be one of the [like, dislike]',
    },
  },
});

schema.index({ userId: 1, commentId: 1 }, { unique: true });
module.exports = model('comment_feedbacks', schema);
