module.exports = function (db) {
    var module = {};

    const admin = require('firebase-admin');
    const moment = require('moment');

    module.getTeam = function () {
        db.ref('teams').once("value", function (snapshot) {
            console.log(snapshot.val());
        }, function(error) {
            console.log(error);
        });
    };

    module.getTeamPlayers = function (teamName) {
        db.ref("teams").orderByChild("name").equalTo(teamName).limitToLast(1).once("value", function (snapshotTeam) {

            const teamKey = Object.keys(snapshotTeam.val())[0];
            const teamPlayersPath = 'team_players/' + teamKey;

            db.ref(teamPlayersPath).once("value", function (snapshotTeamPlayers) {
                console.log(snapshotTeamPlayers.val());
            
            }, function(error) {
                console.log(error);
            });

        }, function(error) {
            console.log(error);
        });
    };

    return module;
}