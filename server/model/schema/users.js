const { Schema, model } = require('mongoose');

const schema = new Schema(
  {
    fname: {
      type: Schema.Types.String,
      lowercase: true,
      required: [true, 'first name is required'],
      minLength: 3,
      maxLength: 15,
    },
    lname: {
      type: Schema.Types.String,
      lowercase: true,
      required: [true, 'last name is required'],
      minLength: 3,
      maxLength: 15,
    },
    username: {
      type: Schema.Types.String,
      trim: true,
      required: [true, 'username is required'],
      minLength: 6,
      maxLength: 20,
      index: { unique: true },
    },
    age: {
      type: Schema.Types.Number,
      min: 5,
      max: 95,
    },
    email: {
      type: Schema.Types.String,
      lowercase: true,
      required: [true, 'email is required'],
      index: { unique: true },
    },
    password: {
      type: Schema.Types.String,
      required: [true, 'password is required'],
    },
    as: {
      type: Schema.Types.String,
      trim: true,
      uppercase: true,
      default: 'USER',
      enum: {
        values: ['USER'],
        message: '`as` must be USER',
      },
    },
  },
  { timestamps: true }
);

module.exports = model('users', schema);
