module.exports = function () {

  const moment = require('moment');
  const CronJob = require('cron').CronJob;
  const http = require("http");

  const pingUrl = process.env.PING || 'http://localhost:5000/server/ping';
  console.log('ping url: ' + pingUrl);

  new CronJob('0 * * * * *', function () {
    console.log(moment().format());
    http.get(pingUrl);
  }, null, true, 'America/Manaus');

}