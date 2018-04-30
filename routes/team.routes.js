module.exports = function(app, db) {

    const team = require('../controllers/team.controller.js')(db);

    app.get('/teamHistory', team.getHistoricoTimeAtivo);
    app.post('/team', team.criarTime);
    app.get('/team/list', team.getListaTimes);
    app.post('/team/players', team.salvarJogadores);
}