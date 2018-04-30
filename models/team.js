module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');

    function Team(id, name, createTime, startTime, endTime) {
        this.id = id;
        this.name = name;
        this.createTime = createTime;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    //TODO: verificar se nome já existe antes de criar um novo time.
    module.criarTime = function (time) {
        return new Promise(function (resolve, reject) {

            let newRef =  db.ref('v2/teams').push();
            newRef.set({
                name: time.name,
                createTime: admin.database.ServerValue.TIMESTAMP
            }).then(value => {
                newRef.once("value", function (snapshot) {
                    resolve(new Team(
                        snapshot.key,
                        snapshot.val().name,
                        snapshot.val().createTime,
                        snapshot.val().startTime,
                        snapshot.val().endTime
                    ));
                }, function(error) {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });

        });
    };

    module.getListaTimes = function () {
        return new Promise(function (resolve, reject) {
            db.ref('v2/teams').once("value", function (snapshot) {
                
                const times = []

                snapshot.forEach(function(childSnapshot) {
                    times.push(new Team(
                        childSnapshot.key,
                        childSnapshot.val().name,
                        childSnapshot.val().createTime,
                        childSnapshot.val().startTime,
                        childSnapshot.val().endTime
                    ));
                });

                resolve(times);
            }, function(error) {
                reject(error);
            });
        });
    };

    module.getTimeAtivo = function () {
        return new Promise(function (resolve, reject) {
            db.ref('v2/teams').orderByChild("active").equalTo(true).limitToLast(1).once("value", function (snapshot) {
                
                snapshot.forEach(function(childSnapshot) {
                    resolve(new Team(
                        childSnapshot.key,
                        childSnapshot.val().name,
                        childSnapshot.val().createTime,
                        childSnapshot.val().startTime,
                        childSnapshot.val().endTime
                    ));
                });

                resolve();
            }, function(error) {
                reject(error);
            });
        });
    };

    module.salvarJogadores = function (timeId, listaJogadores) {
        return new Promise(function (resolve, reject) {

            db.ref('v2/teams/' + timeId).once("value", function (snapshot) {
                const team = snapshot.val();
                if (team) {
                    let promises = [];
                    for(const i in listaJogadores) {
                        promises.push(module.salvarJogador(timeId, listaJogadores[i]));
                    }
                    Promise.all(promises).then(() => {
                        resolve(snapshot);
                    }).catch(error => {
                        reject(error);
                    });
                } else {
                    reject('Time não encontrado!');
                }
            }, function(error) {
                reject(error);
            });

        });
    };

    module.salvarJogador = function (timeId, jogador) {
        return new Promise(function (resolve, reject) {

            const url = 'v2/team_players/' + timeId + '/players/' + jogador.id;
            console.log(url);
            db.ref(url).set(jogador.name).then(value => {
                db.ref(url).once("value", function (snapshot) {
                    resolve(snapshot.val());
                }, function(error) {
                    reject(error);
                });
            }).catch(error => {
                reject(error);
            });

        });
    };

    return module;
}