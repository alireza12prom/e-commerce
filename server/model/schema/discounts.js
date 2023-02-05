const { Schema, model } = require('mongoose');

const schema = new Schema({
  percent: {
    type: Schema.Types.Number,
    max: 100,
    min: 1,
    require: [true, 'percent is required'],
  },
  expire_at: {
    type: Schema.Types.Date,
    require: [true, 'the expire time must be specify'],
    index: { expireAfterSeconds: 0 },
  },
});

module.exports = model('discounts', schema);
