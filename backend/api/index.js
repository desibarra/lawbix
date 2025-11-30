import app from '../app.js';

export default async (req, res) => {
    if (!req.body) req.body = {};
    return app(req, res);
};
