const User = require("../models/utilisateur");

module.exports = function(req, res, next) {
    const whiteListedPaths = new RegExp('^/utilisateur/(signin$|signup$|details)');
    if (req.path.match(whiteListedPaths)) {
        next();
    } else {
        try {
            const authorization = req.headers['authorization'];
            if (!authorization) {
                res.status(403).end();
            }
            User.findOne({
                token: authorization
            }).then((data) => {
                if (data) {
                    next();
                } else {
                    res.status(403).end();
                }
            })
        } catch(error) {
            res.status(403).end;
        }
    }
}
