const app = require('../app');

module.exports = async (req, res) => {
  if (!req.body) req.body = {};
  return app(req, res);
};
