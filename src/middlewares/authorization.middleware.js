export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).send({ status: 'error', message: 'Unauthorized' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).send({ status: 'error', message: 'Forbidden' });
        }
        next();
    };
};
