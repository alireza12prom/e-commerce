const { Schema, model } = require('mongoose');

const schema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: [true, '`userId` is required'],
    index: { unique: true },
  },
  expire_at: {
    type: Schema.Types.Number,
    required: [true, '`expire_at` is required'],
    index: { expireAfterSeconds: 0 },
  },
});

module.exports = model('blocked_users', schema);
