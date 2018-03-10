module.exports = function(app, db) {

    const server = require('../controllers/server.controller.js')(db);

    app.get('/', server.inicio);
    app.get('/server/ping', server.ping);
    app.get('/server/log', server.log);
}