module.exports = function(app, db) {

    const player = require('../controllers/player.controller.js')(db);

    app.get('/player/:id', player.get);
}