const csv = require('csvtojson');
const request = require('request');
const logger = require('../logger');

exports.readCsv = async (req, res) => {
  let response = [];
  await csv()
    .fromStream(request.get('https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.csv'))
    .subscribe(
      json =>
        new Promise(resolve => {
          resolve();
          logger.info(json);
          response = [...response, json];
        }),
      null,
      null
    );
  return res.send(response);
};
