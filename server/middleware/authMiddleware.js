const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {
        // Get token from header
        const token = req.header('x-auth-token');

        // Check if token missing
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        // Verify token
        const decoded = jwt.verify(token, 'secretkey123');

        req.user = decoded;
        next();

    } catch (err) {
        return res.status(401).json({ msg: 'Token is not valid' });
    }
};