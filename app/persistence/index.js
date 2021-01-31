/*
 * Módulo de persistencia.
 */

/* eslint-disable max-len */
/* eslint-disable no-mixed-operators */
/* eslint-disable prettier/prettier */
/* eslint-disable max-classes-per-file */

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
 * Error al conectarse con un servidor para descargar contenido.
 */
class ConnectionRefusedError extends Error {
  constructor(endpoint, message) {
    super(message);
    this.name = 'ConnectionRefusedError';
    this.endpoint = endpoint;
  }
}

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

/*
 * Error al descargar un recurso incompleto.
 */
class IncompleteDownloadError extends Error {
  constructor(downloaded, size, message) {
    super(message);
    this.name = 'IncompleteDownloadError';
    this.downloaded = downloaded;
    this.size = size;
  }
}

module.exports = {
  /*
   * Todas las excepciones disponibles para este módulo.
   */
  exception: {
    ConnectionRefusedError,
    DownloadError,
    IncompleteDownloadError
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
      let size = 0;
      const request = protocol.get(endpoint, response => {
        if (response.statusCode === OK) {
          size = parseInt(response.headers[CONTENT_LENGTH]);
          log.info(`Downloading resource of ${size} bytes...`);
          response.pipe(file);
        } else {
          const exception = new DownloadError(
            response,
            `Cannot download resource from '${endpoint}' in '${destinationPath}'.`
          );
          reject(exception);
        }
      });
      request.on('error', error => {
        log.error(error);
        const exception = new ConnectionRefusedError(
          endpoint,
          `Cannot connect with '${endpoint}'. Server seems down.`
        );
        reject(exception);
      });
      file.on(FINISH_EVENT, error => {
        if (error) {
          reject(error);
        } else {
          const time = process.hrtime(startTime);
          const downloaded = fs.statSync(destinationPath).size;
          if (downloaded === size) {
            log.info(`Resource successfully downloaded in ${time[0] + 1E-9 * time[1]} s.`);
            resolve(destinationPath);
          } else {
            const completed = 100.0 * (downloaded / size);
            const exception = new IncompleteDownloadError(
              downloaded, size,
              `The downloaded resource was incomplete: '${downloaded}' bytes obtained (${completed} %).`
            );
            reject(exception);
          }
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
    return new Promise((resolve_, reject_) => {
      const resolve = x => {
        config.global.updating = false;
        resolve_(x);
      };
      const reject = x => {
        config.global.updating = false;
        reject_(x);
      };
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
              config.global.updating = true;
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
