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

    return module;
}