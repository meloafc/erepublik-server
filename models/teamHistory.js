module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');

    function TeamHistory(id, name, startTime, endTime, totalMedalsWon, players) {
        this.id = id;
        this.name = name;
        this.startTime = startTime;
        this.endTime = endTime;
        this.totalMedalsWon = totalMedalsWon;
        this.players = players;
    }

    function TeamHistoryPlayer(id, name, position, startTime, endTime, initialMedals, finalMedals, totalMedalsWon) {
        this.id = id;
        this.name = name;
        this.position = position;
        this.startTime = startTime;
        this.endTime = endTime;
        this.initialMedals = initialMedals;
        this.finalMedals = finalMedals
        this.totalMedalsWon = totalMedalsWon;
    }

    module.getHistorico = function (time) {
        return new Promise(function (resolve, reject) {

            const timeUrl = 'v2/team_history/' + time.id;
            db.ref(timeUrl).once("value", function (snapshot) {
                resolve(snapshot);
            }, function(error) {
                reject(error);
            });
            
        });
    };

    module.criarHistorico = function (time, listaJogadores) {
        return new Promise(function (resolve, reject) {

            let players = {};
            for(const i in listaJogadores) {
                let player = new TeamHistoryPlayer(
                    listaJogadores[i].id,
                    listaJogadores[i].name,
                    '1 ... ' + listaJogadores.length,
                    listaJogadores[i].lastUpdate,
                    listaJogadores[i].lastUpdate,
                    listaJogadores[i].resistanceHero,
                    listaJogadores[i].resistanceHero,
                    0
                );
                players[player.id] = player;
            }

            let novoHistorico = new TeamHistory(
                time.id,
                time.name,
                'undefined',
                'undefined',
                0,
                players
            );

            const timeUrl = 'v2/team_history/' + novoHistorico.id;

            db.ref(timeUrl).set({
                name: novoHistorico.name,
                startTime: admin.database.ServerValue.TIMESTAMP,
                endTime: admin.database.ServerValue.TIMESTAMP,
                totalMedalsWon: novoHistorico.totalMedalsWon,
                players: novoHistorico.players
            }).then(value => {
                db.ref(timeUrl).once("value", function (snapshot) {
                    resolve(snapshot);
                }, function(error) {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });
        });
    };

    module.atualizarHistorico = function (time, listaJogadores) {
        return new Promise(function (resolve, reject) {

            let teamTotalMedalsWon = 0;
            const playersUrl = 'v2/team_history/' + time.id + '/players';
            const timeUrl = 'v2/team_history/' + time.id;

            module.getMapNovasPosicoes(time, listaJogadores).then(mapPosition => {

                db.ref(playersUrl).once("value", function (snapshotPlayers) {
                    snapshotPlayers.forEach(function (snapshotPlayer) {

                        for(const i in listaJogadores) {
                            const player = listaJogadores[i];
                            if (player.id === snapshotPlayer.val().id) {

                                let playerTotalMedalsWon = player.resistanceHero - snapshotPlayer.val().initialMedals;
                                teamTotalMedalsWon = teamTotalMedalsWon + playerTotalMedalsWon;

                                let position = mapPosition.get(playerTotalMedalsWon);

                                snapshotPlayer.ref.update({
                                    position: position,
                                    endTime: player.lastUpdate,
                                    finalMedals: player.resistanceHero,
                                    totalMedalsWon: playerTotalMedalsWon
                                })

                            }
                        }

                    })
                }, function(error) {
                    reject(error);
                }).then(value => {

                    console.log(teamTotalMedalsWon);

                    db.ref(timeUrl).update({
                        endTime: admin.database.ServerValue.TIMESTAMP,
                        totalMedalsWon: teamTotalMedalsWon
                    }).then(value => {
                        db.ref(timeUrl).once("value", function (snapshot) {
                            resolve(snapshot);
                        }, function(error) {
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

    module.getMapNovasPosicoes = function (time, listaJogadores) {
        return new Promise(function (resolve, reject) {

            const playersUrl = 'v2/team_history/' + time.id + '/players';
            const positions = [];

            db.ref(playersUrl).once("value", function (snapshotPlayers) {
                snapshotPlayers.forEach(function (snapshotPlayer) {

                    for(const i in listaJogadores) {
                        const player = listaJogadores[i];
                        if (player.id === snapshotPlayer.val().id) {

                            let playerTotalMedalsWon = player.resistanceHero - snapshotPlayer.val().initialMedals;
                            positions.push(playerTotalMedalsWon);
                        }
                    }

                })
            }, function(error) {
                reject(error);
            }).then(value => {

                // desc order
                positions.sort(function(a,b){
                    return b - a
                });

                const mapPosition = new Map();
                let position = 1;
                positions.forEach(value => {
                    let label = mapPosition.get(value);
                    if(label) {
                        let preLabel = label.split(/[ ,]+/)[0];
                        mapPosition.set(value, preLabel + " ... " + position);
                    } else {
                        mapPosition.set(value, position + "");
                    }
                    position +=1;
                });

                resolve(mapPosition);

            }).catch(error => {
                reject(error);
            });
        });
    };

    return module;
}