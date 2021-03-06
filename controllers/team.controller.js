module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');
    const moment = require('moment');
    const player = require('./player.controller.js')(db);

    const team = require('../models/team.js')(db);
    const teamHistory = require('../models/teamHistory.js')(db);

    module.getHistoricoTimeAtivo = function (req, res) {
        team.getTimeAtivo().then(timeAtivo => {

            teamHistory.getHistorico(timeAtivo).then(historicoTimeAtivo => {
                res.send(historicoTimeAtivo);
            }).catch(error => {
                return res.send(error);
            });

        }).catch(error => {
            return res.send(error);
        });
    };

    module.criarTime = function (req, res) {
        const time = req.body;
        team.criarTime(time).then(timeCriado => {
            res.send(timeCriado);
        }).catch(error => {
            res.send(error);
        });
    };

    module.getListaTimes = function (req, res) {
        team.getListaTimes().then(times => {
            res.send(times);
        }).catch(error => {
            res.send(error);
        });
    };

    module.salvarJogadores = function (req, res) {
        const timeId = req.body.timeId;
        const listaJogadores = req.body.listaJogadores;
        team.salvarJogadores(timeId, listaJogadores).then(resultado => {
            res.send(resultado);
        }).catch(error => {
            res.send(error);
        });
    };

    module.contabilizarTimeAtivo = function () {
        return new Promise(function (resolve, reject) {

            team.getTimeAtivo().then(timeAtivo => {
                if(!timeAtivo) {
                    return reject('Sem time ativo!');
                }

                module.getHoraDoBanco().then(horaDoBanco => {
                    if (timeAtivo.endTime) {
                        console.log('timeAtivo.endTime:' + timeAtivo.endTime);
                        console.log('horaDoBanco:' + horaDoBanco);
                        if (timeAtivo.endTime < horaDoBanco) {
                            return reject('Time chegou ao fim!');
                        }
                    }
                    module.getJogadoresDoTime(timeAtivo.name).then(listaId => {
                        player.getEstadoAtualDosJogadores(listaId).then(listaJogadores => {
                            module.criarOuAtualizarHistorico(timeAtivo, listaJogadores);
                            resolve(listaJogadores);
                        }).catch(error => {
                            reject(error);
                        });
                    }).catch(error => {
                        reject(error);
                    });
                }).catch(error => {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    };

    module.getHoraDoBanco = function () {
        return new Promise(function (resolve, reject) {
            db.ref("/.info/serverTimeOffset").on('value', function(offset) {
                var offsetVal = offset.val() || 0;
                var serverTime = Date.now() + offsetVal;
                resolve(serverTime);
            }, function(error) {
                reject(error);
            });
        });
    };

    module.getJogadoresDoTime = function (teamName) {
        return new Promise(function (resolve, reject) {
            db.ref("v2/teams").orderByChild("name").equalTo(teamName).limitToLast(1).once("value", function (snapshotTeam) {

                const teamKey = Object.keys(snapshotTeam.val())[0];
                const teamPlayersPath = 'v2/team_players/' + teamKey;
    
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

    module.criarOuAtualizarHistorico = function (time, listaJogadores) {
        return new Promise(function (resolve, reject) {

            const timeUrl = 'v2/team_history/' + time.id;
            db.ref(timeUrl).once("value", function (snapshot) {

                if (snapshot.exists()) {
                    console.log('existe');
                    teamHistory.atualizarHistorico(time, listaJogadores);
                } else {                    
                    console.log('não existe');
                    teamHistory.criarHistorico(time, listaJogadores);
                }
                

                resolve(snapshot);
            }, function(error) {
                reject(error);
            });
        });
    };
    

    return module;
}