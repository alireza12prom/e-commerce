const { Schema, model } = require('mongoose');

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    require: [true, '`apikey` is required'],
    index: { unique: true },
  },
  apikey: {
    type: Schema.Types.String,
    trim: true,
    require: [true, '`apikey` is required'],
    length: 64,
  },
  as: {
    type: Schema.Types.String,
    trim: true,
    uppercase: true,
    require: [true, '`as` is required'],
    enum: {
      values: ['ADMIN', 'USER'],
      message: "`as` must be one of the ['ADMIN', 'USER']",
    },
  },
  expire_at: {
    type: Schema.Types.Number,
    index: { expireAfterSeconds: 0 },
    require: [true, '`expire_at` is required'],
  },
  requests: {
    type: Schema.Types.Number,
    default: 0,
    min: 0,
  },
});

module.exports = model('apikeys', schema);
