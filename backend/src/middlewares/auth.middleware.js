const userModel = require('../models/userModel');
const jwt = require('jsonwebtoken');


async function authUser(req, res, next) {

    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId)

        req.user = user;

        next()

    } catch (err) {
        res.status(401).json({ message: 'Unauthorized' });
    }

}

module.exports = {
    authUser
}