module.exports = function(app) {

    var server = require('../controllers/server.controller.js');

    app.get('/teste', server.teste);
}