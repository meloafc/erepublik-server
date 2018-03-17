module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');
    const moment = require('moment');
    const player = require('./player.controller.js')(db);

    module.contabilizarTimeAtivo = function () {
        return new Promise(function (resolve, reject) {

            module.getJogadoresDoTime('29ª Equipe').then(listaId => {
                player.getEstadoAtualDosJogadores(listaId).then(listaJogadores => {
                    // TODO: criar a view contando todas as medalhas.
                    console.log(listaJogadores);
                    resolve(listaJogadores);
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });

        });
    };

    module.getTimeAtivo = function () {
        return new Promise(function (resolve, reject) {
            db.ref('teams').limitToLast(1).once("value", function (snapshot) {
                resolve(snapshot.val());
            }, function(error) {
                reject(error);
            });
        });
    };

    module.getJogadoresDoTime = function (teamName) {
        return new Promise(function (resolve, reject) {
            db.ref("teams").orderByChild("name").equalTo(teamName).limitToLast(1).once("value", function (snapshotTeam) {

                const teamKey = Object.keys(snapshotTeam.val())[0];
                const teamPlayersPath = 'team_players/' + teamKey;
    
                db.ref(teamPlayersPath).once("value", function (snapshotTeamPlayers) {

                    let lista = [];
                    for(const id in snapshotTeamPlayers.val().players) {
                        lista.push(id);
                    }
                    resolve(lista);
                
                }, function(error) {
                    reject(error);
                });
    
            }, function(error) {
                reject(error);
            });
        });
    };

    return module;
}