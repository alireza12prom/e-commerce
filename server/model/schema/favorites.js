const { Schema, model } = require('mongoose');

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: [true, 'userId is required'],
  },
  productId: {
    type: Schema.Types.ObjectId,
    required: [true, 'productId is required'],
  },
});

schema.index({ userId: 1, productId: 1 }, { unique: true });
module.exports = model('favorites', schema);
