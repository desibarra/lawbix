const app = require('../app');

module.exports = (req, res) => {
  if (!req.body) req.body = {};
  return app(req, res);
};
