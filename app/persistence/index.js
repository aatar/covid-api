/*
 * Módulo de persistencia.
 */

/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
/* eslint-disable prettier/prettier */

const config = require('../../config'),
  csv = require('csvtojson'),
  fs = require('fs'),
  http = require('http'),
  https = require('https'),
  log = require('../logger'),
  path = require('path'),
  schedule = require('node-schedule');

const { CovidCases } = require('../models');

/*
 * Constantes.
 */
const CONTENT_LENGTH = 'content-length';
const FINISH_EVENT = 'finish';
const HTTPS_SCHEMA = 'https:';
const OK = 200;
const THRESHOLD = config.app.uploadThreshold;
const UPDATE_SCHEMA = [
  'sexo', 'edad', 'edad_anios_meses', 'residencia_pais_nombre', 'residencia_provincia_nombre',
  'residencia_departamento_nombre', 'carga_provincia_nombre', 'fecha_inicio_sintomas', 'fecha_apertura', 'sepi_apertura',
  'fecha_internacion', 'cuidado_intensivo', 'fecha_cui_intensivo', 'fallecido', 'fecha_fallecimiento',
  'asistencia_respiratoria_mecanica', 'carga_provincia_id', 'origen_financiamiento', 'clasificacion', 'clasificacion_resumen',
  'residencia_provincia_id', 'fecha_diagnostico', 'residencia_departamento_id', 'ultima_actualizacion'
];
const UPDATE_TARGET = config.app.updateTarget;

/*
 * Error al descargar un recurso.
 */
class DownloadError extends Error {
  constructor(response, message) {
    super(message);
    this.name = 'DownloadError';
    this.statusCode = response.statusCode;
    this.statusMessage = response.statusMessage;
  }
}

module.exports = {
  /*
   * Todas las excepciones disponibles para este módulo.
   */
  exception: {
    DownloadError
  },

  /*
   * Descarga un recurso desde un endpoint y lo deposita en un archivo.
   */
  download(endpoint, destination) {
    return new Promise((resolve, reject) => {
      const startTime = process.hrtime();
      const destinationPath = path.join(__dirname, `../../${destination}`);
      const file = fs.createWriteStream(destinationPath);
      const protocol = new URL(endpoint).protocol === HTTPS_SCHEMA ? https : http;
      protocol.get(endpoint, response => {
        if (response.statusCode === OK) {
          log.info(`Downloading resource of ${response.headers[CONTENT_LENGTH]} bytes...`);
          response.pipe(file);
        } else {
          const error = new DownloadError(
            response,
            `Cannot download resource from '${endpoint}' in '${destinationPath}'.`
          );
          reject(error);
        }
      });
      file.on(FINISH_EVENT, error => {
        if (error) {
          reject(error);
        } else {
          const time = process.hrtime(startTime);
          log.info(`Resource successfully downloaded in ${time[0] + 1E-9 * time[1]} s.`);
          resolve(destinationPath);
        }
      });
    });
  },

  /*
   * Programa la ejecución de una tarea.
   */
  schedule(when, task) {
    log.info(`Scheduled task '${task.name}' using cron-schema '${when}'.`);
    return schedule.scheduleJob(when, task);
  },

  /*
   * Almacena un dataset en la base de datos.
   */
  store(dataset) {
    return new Promise((resolve, reject) => {
      const startTime = process.hrtime();
      const stream = fs.createReadStream(dataset);
      const buffer = [];
      let uploaded = 0;
      let target = UPDATE_TARGET;
      csv()
        .fromStream(stream)
        .subscribe(
          async json => {
            json.edad_anios_meses = json.edad_años_meses;
            delete json.edad_años_meses;
            buffer.push(json);
            if (buffer.length === THRESHOLD) {
              await CovidCases.bulkCreate(buffer, { updateOnDuplicate: UPDATE_SCHEMA })
                .then(() => {
                  uploaded += buffer.length;
                  buffer.length = 0;
                })
                .catch(error => reject(error));
              if (target < uploaded) {
                target += UPDATE_TARGET;
                CovidCases.count()
                  .then(count => log.info(`The current count is: ${count} records (${uploaded} uploaded).`));
              }
            }
          },
          error => reject(error),
          async () => {
            await CovidCases.bulkCreate(buffer, { updateOnDuplicate: UPDATE_SCHEMA })
              .then(() => {
                uploaded += buffer.length;
                buffer.length = 0;
                const time = process.hrtime(startTime);
                log.info(`Updated ${uploaded} records in ${time[0] + 1E-9 * time[1]} s.`);
                resolve();
              })
              .catch(error => reject(error));
            CovidCases.count()
              .then(count => log.info(`The last count is: ${count} records.`));
          }
        );
    });
  }
};
