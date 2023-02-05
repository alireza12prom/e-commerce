const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    title: {
      type: Schema.Types.String,
      required: [true, 'title is required'],
      lowercase: true,
      trim: true,
      minlength: 5,
      maxLength: 60,
    },
    brand: {
      type: Schema.Types.String,
      lowercase: true,
      trim: true,
      minLength: 2,
      maxLength: 15,
    },
    models: {
      type: Schema.Types.String,
      required: [true, 'model is required'],
      trim: true,
      lowercase: true,
      minLength: 2,
      maxLength: 15,
    },
    category: {
      type: Schema.Types.String,
      trim: true,
      lowercase: true,
      required: [true, 'category is required'],
    },
    description: {
      type: Schema.Types.String,
      required: [true, 'description is required'],
      lowercase: true,
      trim: true,
      maxLength: 140,
    },
    price: {
      type: Schema.Types.Number,
      min: 0.01, // 1 cent
      max: 10_000_000, // 10 million
      required: [true, 'price is required'],
    },
    quentity: {
      type: Schema.Types.Number,
      required: true,
      min: 0,
      max: 1_000_000,
    },
    discountId: {
      type: Schema.Types.ObjectId,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = model('products', schema);
