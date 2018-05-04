// https://github.com/auth0/node-jsonwebtoken

module.exports = function () {
    let module = {};

    const jwt = require('jsonwebtoken');

    module.SECRET = '-a-e-';

    module.gerarToken = function () {
        return jwt.sign({}, module.SECRET);
    };

    return module;
}