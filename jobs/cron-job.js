module.exports = function (db) {

  const job = require('../models/job.js')();
  const tempo = require('../utils/tempo.js')();
  const token = require('../utils/token.js')();
  const CronJob = require('cron').CronJob;
  const http = require("http");

  const pingUrl = process.env.PING || 'http://localhost:5000/server/ping';
  console.log('ping url: ' + pingUrl);

  db.ref("/.info/serverTimeOffset").on('value', function(offset) {
    var offsetVal = offset.val() || 0;
    var serverTime = Date.now() + offsetVal;
    console.log('Servidor firebase time: ' + tempo.converterTimeParaManaus(serverTime));
  });
  
  new CronJob('0 * * * * *', function () {
    console.log(tempo.getDataHoraAtualManaus());
    http.get(pingUrl);
  }, null, true, tempo.ZONE_MANAUS);

  const team = require('../controllers/team.controller.js')(db);
  new CronJob('0 0 * * * *', function () {
    team.contabilizarTimeAtivo();
  }, null, true, tempo.ZONE_MANAUS);

  team.contabilizarTimeAtivo();

  console.log(token.gerarToken());
}