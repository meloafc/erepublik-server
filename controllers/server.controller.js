module.exports = function (db) {
    var module = {};

    module.inicio = function (req, res) {
        res.send('online');
    };

    module.ping = function (req, res) {
        db.ref('server/ping').transaction(function (currentCounter) {
            return (currentCounter || 0) + 1;
        });
        res.send('pong');
    };

    module.log = function (req, res) {
        db.ref('server').once("value", function (snap) {
            res.send(snap);
        });
    };

    return module;
}