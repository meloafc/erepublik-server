module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');
    const moment = require('moment');
    const Crawler = require("crawler");

    module.update = function () {
        console.log('iniciando update.');

        const newRef = db.ref('team_players_rh_hour').push();
        newRef.update({ startJob: admin.database.ServerValue.TIMESTAMP });

        var crawler = new Crawler({
            //rateLimit: 1000,
            callback: function (error, res, done) {
                if (error) {
                    console.log(error);
                } else {
                    const $ = res.$;

                    const fields = res.request.uri.href.split('/');
                    const id = fields[fields.length-1];

                    $('img.citizen_avatar').each(function (i, element) {
                        const name = $(this).attr('alt');

                        $('#achievment').find('li').each(function (i, element) {
                            let medal = $(this).children('img').attr('alt');
                            if (medal === 'resistance hero') {
                                let resistanceHero = $(this).children('.counter').text();
                                if (!resistanceHero) {
                                    resistanceHero = 0;
                                }
                                newRef.child('players/' + id).update({
                                    name: name,
                                    resistanceHero: resistanceHero,
                                    time: admin.database.ServerValue.TIMESTAMP
                                });
                            }
                        });

                    });
                }
                done();
            }
        });

        crawler.on('drain', function () {
            newRef.update({ endJob: admin.database.ServerValue.TIMESTAMP });
            console.log('finalizando update.');
        });

        db.ref('players').once('value').then(snapshot => {

            snapshot.forEach(player => {
                crawler.queue('https://www.erepublik.com/br/citizen/profile/' + player.key);
            });

        }).catch(err => {
            console.log('Error getting documents', err);
        });
    };

    return module;
}