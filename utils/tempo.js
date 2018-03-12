module.exports = function () {
  let module = {};

  const moment = require('moment-timezone');

  module.ZONE_MANAUS = 'America/Manaus';

  module.getDataHoraAtualManaus = function () {
    return moment().tz(module.ZONE_MANAUS).format();
  };

  return module;
}