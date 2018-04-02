/*
  const hash = require('./utils/hash.js')();
  hash.gerarHash('123').then(resultado => {
      console.log(resultado);
    
    hash.comparar('123', resultado).then(function(res) {
      console.log(res);
    });
  });
*/

module.exports = function () {
  let module = {};

  const bcrypt = require('bcrypt');
  const saltRounds = 11;

  module.gerarHash = function (senha) {
    return bcrypt.hash(senha, saltRounds);
  };

  module.comparar = function (senha, hash) {
    return bcrypt.compare(senha, hash);
  };

  return module;
}