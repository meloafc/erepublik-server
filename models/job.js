module.exports = function (db) {
  let module = {};

  /**
    lastExecution
    nextExecution
  */

  module.JOB_1_SEG = '1seg';
  module.JOB_10_SEG = '10seg';

  module.monitorar = function () {

  };

  module.job1Seg = function () {
    console.log(module.JOB_1_SEG);
  };

  module.job10Seg = function () {
    console.log(module.JOB_10_SEG);
  };

  module.getDatabaseTime = new Promise(
    function (resolve, reject) {
      resolve('123');
    }
  );

  return module;
}