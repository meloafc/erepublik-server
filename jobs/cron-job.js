module.exports = function (db) {

  const tempo = require('../utils/tempo.js')();
  const CronJob = require('cron').CronJob;
  const http = require("http");

  const pingUrl = process.env.PING || 'http://localhost:5000/server/ping';
  console.log('ping url: ' + pingUrl);

  new CronJob('0 * * * * *', function () {
    console.log(tempo.getDataHoraAtualManaus());
    http.get(pingUrl);
  }, null, true, tempo.ZONE_MANAUS);

  const player = require('../controllers/player.controller.js')(db);
  new CronJob('0 0 * * * *', function () {
    player.update();
  }, null, true, tempo.ZONE_MANAUS);

}