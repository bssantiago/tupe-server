"use strict";
exports.ensureAuthenticated = (req, res, next) => {
    const token = req.headers['authentication'];
    if (!token) {
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
    return next();
};
//# sourceMappingURL=middleware.js.map