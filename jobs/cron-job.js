module.exports = function (db) {

  const moment = require('moment');
  const CronJob = require('cron').CronJob;
  const http = require("http");

  const pingUrl = process.env.PING || 'http://localhost:5000/server/ping';
  console.log('ping url: ' + pingUrl);

  new CronJob('0 * * * * *', function () {
    console.log(moment().format());
    http.get(pingUrl);
  }, null, true, 'America/Manaus');

  const player = require('../controllers/player.controller.js')(db);
  new CronJob('0 0 * * * *', function () {
    player.update();
  }, null, true, 'America/Manaus');

}