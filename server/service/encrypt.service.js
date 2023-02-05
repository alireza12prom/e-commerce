'use strict';

const crypto = require('node:crypto'),
  bcrypt = require('bcryptjs');
/**
 *
 * @returns {String}
 */
const genApiKey = () => {
  const uuid = crypto.randomUUID();
  const date = Date.now();

  const hash = crypto.createHash('sha256');
  hash.update(`${uuid}:${date}`);
  return hash.digest().toString('hex');
};

/**
 *
 * @param {String} password
 * @returns {String}
 */
const hashPassword = (password) => {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
};

/**
 *
 * @param {String} string
 * @param {String} hash
 * @returns {String}
 */
const comparePassword = (string, hash) => {
  return bcrypt.compareSync(string, hash);
};

module.exports = { genApiKey, hashPassword, comparePassword };
