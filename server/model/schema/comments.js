const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      lowercase: true,
      trim: true,
      minLength: 5,
      maxLength: 20,
      required: [true, 'title is required'],
    },
    score: {
      type: Schema.Types.Number,
      max: 5,
      min: 1,
      required: [true, 'score is required'],
    },
    opinion: {
      type: Schema.Types.String,
      lowercase: true,
      trim: true,
      minLength: 5,
      maxLength: 60,
    },
    feedbacks: {
      likes: {
        type: Schema.Types.Number,
        min: 0,
        default: 0,
      },
      dislikes: {
        type: Schema.Types.Number,
        min: 0,
        default: 0,
      },
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'userId is required'],
    },
    productId: {
      type: Schema.Types.ObjectId,
      required: [true, 'productId is required'],
    },
  },
  { timestamps: true }
);

schema.index({ userId: 1, productId: 1 }, { unique: true });
module.exports = model('comments', schema);
