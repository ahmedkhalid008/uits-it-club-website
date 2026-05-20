const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            throw new Error('No Authorization header');
        }
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate.' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'Admin') {
        return res.status(403).send({ error: 'Access denied. Admin only.' });
    }
    next();
};

module.exports = { auth, adminOnly };
