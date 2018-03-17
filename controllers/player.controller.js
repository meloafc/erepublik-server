module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');
    const moment = require('moment');
    const Crawler = require("crawler");
    const request = require('request');
    const cheerio = require('cheerio');

    function Player(id, name, resistanceHero, lastUpdate) {
        this.id = id;
        this.name = name;
        this.resistanceHero = resistanceHero;
        this.lastUpdate = lastUpdate;
    }

    module.extrairJogadorDoHTML = function (res) {
        return new Promise(function (resolve, reject) {
            const $ = res.$;

            const fields = res.request.uri.href.split('/');
            const id = fields[fields.length - 1];

            var contador = 0;

            $('img.citizen_avatar').each(function (i, element) {
                const name = $(this).attr('alt');

                $('#achievment').find('li').each(function (i, element, array) {
                    let medal = $(this).children('img').attr('alt');
                    if (medal === 'resistance hero') {
                        let resistanceHero = $(this).children('.counter').text();
                        if (!resistanceHero) {
                            resistanceHero = 0;
                        }

                        resolve(new Player(id, name, resistanceHero));

                        contador++;
                        if (contador === array.length) {
                            reject();
                        }
                    }
                });
            });
        });
    };

    module.get = function (req, res) {
        let id = req.params.id;

        let url = 'https://www.erepublik.com/br/citizen/profile/' + id;
        request(url, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                const $ = cheerio.load(body);

                $('img.citizen_avatar').each(function (i, element) {
                    const name = $(this).attr('alt');

                    $('#achievment').find('li').each(function (i, element) {
                        let medal = $(this).children('img').attr('alt');
                        if (medal === 'resistance hero') {
                            let resistanceHero = $(this).children('.counter').text();
                            if (!resistanceHero) {
                                resistanceHero = 0;
                            }
                            return res.json({
                                "id": id,
                                "name": name,
                                "resistance_hero": resistanceHero
                            });
                        }
                    });

                });

            } else {
                return res.json({});
            }
        });
    };

    module.getEstadoAtualDosJogadores = function (listaId) {
        return new Promise(function (resolve, reject) {

            let lista = [];
            const crawler = new Crawler({
                callback: function (error, res, done) {
                    if (error) {
                        console.log(error);
                        done();
                    } else {
                        module.extrairJogadorDoHTML(res).then(player => {
                            module.salvarJogador(player).then(playerSaved => {
                                lista.push(playerSaved);
                                done();
                            }).catch(error => {
                                console.log(error);
                                done();
                            });
                        }).catch(error => {
                            console.log(error);
                            done();
                        });
                    }
                }
            });

            listaId.forEach(id => {
                crawler.queue('https://www.erepublik.com/br/citizen/profile/' + id);
            });

            crawler.on('drain', function () {
                resolve(lista);
            });

        });
    };

    module.salvarJogador = function (player) {
        return new Promise(function (resolve, reject) {

            let newRef =  db.ref('player_history/' + player.id).push();
            newRef.set({
                name: player.name,
                resistanceHero: player.resistanceHero,
                lastUpdate: admin.database.ServerValue.TIMESTAMP
            }).then(value => {
                newRef.once("value", function (snapshot) {
                    resolve(new Player(
                        snapshot.key,
                        snapshot.val().name,
                        snapshot.val().resistanceHero,
                        snapshot.val().lastUpdate
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