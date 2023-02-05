module.exports = (expire_after) => {
  return new Date(Date.now() + expire_after * 60 * 1000);
};
