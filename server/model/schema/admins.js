const { Schema, model } = require('mongoose');

const schema = new Schema({
  username: {
    type: Schema.Types.String,
    trim: true,
    required: [true, 'username is required'],
    minLength: 6,
    maxLength: 20,
    index: { unique: true },
  },
  password: {
    type: Schema.Types.String,
    trim: true,
    required: [true, '`password` is required'],
  },
  as: {
    type: Schema.Types.String,
    trim: true,
    uppercase: true,
    default: 'ADMIN',
    enum: {
      values: ['ADMIN'],
      message: '`as` must be ADMIN',
    },
  },
});

module.exports = model('admins', schema);
