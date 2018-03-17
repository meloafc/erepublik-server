module.exports = function(app, db) {

    const team = require('../controllers/team.controller.js')(db);

    app.post('/team', team.criarTime);
}