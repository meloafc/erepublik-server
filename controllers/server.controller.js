module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');
    const moment = require('moment');

    module.inicio = function (req, res) {
        res.send('online');
    };

    module.ping = function (req, res) {
        db.ref("server").orderByChild("start").limitToLast(1).once("value", function (snap) {
            let refPath = 'server/' + Object.keys(snap.val())[0];
            db.ref(refPath).update({
                lastupdate: admin.database.ServerValue.TIMESTAMP
            });
        });

        res.send('pong');
    };

    module.log = function (req, res) {
        db.ref('server').once("value", function (snapshot) {

            const retorno = []

            snapshot.forEach(object => {
                const start = moment(object.val().start).format("DD/MM/YYYY HH:mm:ss");
                let lastupdate = '-';
                if(object.val().lastupdate) {
                    lastupdate = moment(object.val().lastupdate).format("DD/MM/YYYY HH:mm:ss");
                }
                let duration = object.val().lastupdate - object.val().start;
                if(!duration) {
                    duration = 0;
                }
                duration = moment.utc(duration).format("HH:mm:ss");

                retorno.push({
                    startTime: object.val().start,
                    start: start,
                    lastupdate: lastupdate,
                    duration: duration
                });
            });

            retorno.sort(function(a, b) {
                return b.startTime - a.startTime;
            });

            res.send(retorno);
        });
    };

    return module;
}