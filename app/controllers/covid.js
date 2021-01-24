/* eslint-disable complexity */
/* eslint-disable indent */
/* eslint-disable id-length */
/* eslint-disable no-extra-parens */
/* eslint-disable no-nested-ternary */
const csv = require('csvtojson');
const fs = require('fs');
// const request = require('request');
const logger = require('../logger');
const { CovidCases } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { PROVINCES /* POBLATION*/ } = require('./constants');

exports.readCsv = async (req, res) => {
  req.setTimeout(1000000000);
  // await CovidCases.destroy({
  //   where: {},
  //   truncate: true
  // });
  const count = await CovidCases.find({
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'count']]
  });
  const fileReadStream = fs.createReadStream('Covid19Casos.csv');
  // eslint-disable-next-line no-unused-vars
  let invalidLineCount = 0;
  let lineIndex = 0;
  await csv({ delimiter: ',', fork: true })
    .preFileLine(fileLineString => {
      const invalidLinePattern = /^['"].*[^"'];/;
      if (
        (lineIndex !== 0 && lineIndex < count.dataValues.count) ||
        invalidLinePattern.test(fileLineString)
      ) {
        logger.info(`Line #${lineIndex + 1} is invalid, skipping`);
        // eslint-disable-next-line no-param-reassign
        fileLineString = '';
        invalidLineCount++;
      }
      lineIndex += 1;
      return fileLineString;
    })
    .fromStream(fileReadStream)
    .subscribe(
      json => {
        try {
          console.log(json);
          const {
            id_evento_caso,
            sexo,
            edad,
            edad_años_meses,
            residencia_pais_nombre,
            residencia_provincia_nombre,
            residencia_departamento_nombre,
            carga_provincia_nombre,
            fecha_inicio_sintomas,
            fecha_apertura,
            sepi_apertura,
            fecha_internacion,
            cuidado_intensivo,
            fecha_cui_intensivo,
            fallecido,
            fecha_fallecimiento,
            // eslint-disable-next-line id-length
            asistencia_respiratoria_mecanica,
            carga_provincia_id,
            origen_financiamiento,
            clasificacion,
            clasificacion_resumen,
            residencia_provincia_id,
            fecha_diagnostico,
            residencia_departamento_id,
            ultima_actualizacion
          } = json;
          return CovidCases.create({
            id_evento_caso,
            sexo,
            edad,
            edad_anios_meses: edad_años_meses,
            residencia_pais_nombre,
            residencia_provincia_nombre,
            residencia_departamento_nombre,
            carga_provincia_nombre,
            fecha_inicio_sintomas,
            fecha_apertura,
            sepi_apertura,
            fecha_internacion,
            cuidado_intensivo,
            fecha_cui_intensivo,
            fallecido,
            fecha_fallecimiento,
            // eslint-disable-next-line id-length
            asistencia_respiratoria_mecanica,
            carga_provincia_id,
            origen_financiamiento,
            clasificacion,
            clasificacion_resumen,
            residencia_provincia_id,
            fecha_diagnostico,
            residencia_departamento_id,
            ultima_actualizacion
          });
        } catch (error) {
          return new Promise(resolve => resolve());
        }
      },
      err => {
        logger.info(err);
      },
      () => {
        logger.info('success');
      }
    );
  return res.send('OK');
};

// const csv = require('csv-parser');
// exports.readCsv = async (req, res) => {
//   await CovidCases.destroy({
//     where: {},
//     truncate: true
//   });

//   fs.createReadStream('Covid19Casos.csv')
//     .pipe(csv())
//     .on('data', data => {
//       const {
//         id_evento_caso,
//         sexo,
//         edad,
//         edad_años_meses,
//         residencia_pais_nombre,
//         residencia_provincia_nombre,
//         residencia_departamento_nombre,
//         carga_provincia_nombre,
//         fecha_inicio_sintomas,
//         fecha_apertura,
//         sepi_apertura,
//         fecha_internacion,
//         cuidado_intensivo,
//         fecha_cui_intensivo,
//         fallecido,
//         fecha_fallecimiento,
//         // eslint-disable-next-line id-length
//         asistencia_respiratoria_mecanica,
//         carga_provincia_id,
//         origen_financiamiento,
//         clasificacion,
//         clasificacion_resumen,
//         residencia_provincia_id,
//         fecha_diagnostico,
//         residencia_departamento_id,
//         ultima_actualizacion
//       } = data;
//       return CovidCases.create({
//         id_evento_caso,
//         sexo,
//         edad,
//         edad_anios_meses: edad_años_meses,
//         residencia_pais_nombre,
//         residencia_provincia_nombre,
//         residencia_departamento_nombre,
//         carga_provincia_nombre,
//         fecha_inicio_sintomas,
//         fecha_apertura,
//         sepi_apertura,
//         fecha_internacion,
//         cuidado_intensivo,
//         fecha_cui_intensivo,
//         fallecido,
//         fecha_fallecimiento,
//         // eslint-disable-next-line id-length
//         asistencia_respiratoria_mecanica,
//         carga_provincia_id,
//         origen_financiamiento,
//         clasificacion,
//         clasificacion_resumen,
//         residencia_provincia_id,
//         fecha_diagnostico,
//         residencia_departamento_id,
//         ultima_actualizacion
//       });
//     })
//     .on('end', () => res.send('OK, Finished'));
// };

exports.getCases = async (req, res) => {
  const cases = await CovidCases.findAll();
  return res.send(cases);
};

exports.count = async (req, res) => {
  const { icu, dead, respirator, classification, from, to } = req.query;
  const count = await CovidCases.find({
    where: {
      cuidado_intensivo: icu ? (icu === 'true' ? { [Op.eq]: 'SI' } : { [Op.eq]: 'NO' }) : { [Op.like]: '%' },
      fallecido: dead ? (dead === 'true' ? { [Op.eq]: 'SI' } : { [Op.eq]: 'NO' }) : { [Op.like]: '%' },
      asistencia_respiratoria_mecanica: respirator
        ? respirator === 'true'
          ? { [Op.eq]: 'SI' }
          : { [Op.eq]: 'NO' }
        : { [Op.like]: '%' },
      clasificacion_resumen: classification
        ? classification === 'confirmed'
          ? { [Op.eq]: 'Confirmado' }
          : classification === 'suspect'
          ? { [Op.eq]: 'Sospechoso' }
          : { [Op.eq]: 'Descartado' }
        : { [Op.like]: '%' },
      fecha_apertura: {
        [Op.gte]: from ? from : '2000-01-01',
        [Op.lte]: to ? to : '2100-01-01'
      }
    },
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'count']]
  });
  return res.send(count);
};

exports.stats = async (req, res) => {
  const provinceCases = await CovidCases.findAll({
    attributes: [
      ['residencia_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']
    ],
    group: 'residencia_provincia_nombre',
    order: [['residencia_provincia_nombre', 'ASC']]
  });
  // const countryCases = await CovidCases.find({
  //   attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']]
  // });
  const provinceDeaths = await CovidCases.findAll({
    where: { fallecido: { [Op.eq]: 'SI' } },
    attributes: [
      ['residencia_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']
    ],
    group: 'residencia_provincia_nombre',
    order: [['residencia_provincia_nombre', 'ASC']]
  });
  // const countryDeaths = await CovidCases.find({
  //   where: { fallecido: { [Op.eq]: 'SI' } },
  //   attributes: [[Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']]
  // });
  // const poblation = POBLATION;

  let i1 = 0,
    i2 = 0;
  let response = [];

  while (i1 < provinceCases.length && i2 < provinceDeaths.length) {
    if (provinceCases[i1].dataValues.provincia === provinceDeaths[i2].dataValues.provincia) {
      response = [
        ...response,
        {
          provincia: provinceCases[i1].dataValues.provincia,
          casos: provinceCases[i1].dataValues.cantidad,
          muertes: provinceDeaths[i2].dataValues.cantidad
        }
      ];
      i1 += 1;
      i2 += 1;
    } else {
      response = [
        ...response,
        {
          provincia: provinceCases[i1].dataValues.provincia,
          casos: provinceCases[i1].dataValues.cantidad,
          muertes: 0
        }
      ];
      i1 += 1;
    }
  }
  // eslint-disable-next-line dot-notation
  return res.send(response);
};

exports.lastUpdate = async (req, res) => {
  const covidCase = await CovidCases.findOne({
    where: {}
  });
  return res.send({ last_update: covidCase.ultima_actualizacion });
};

exports.provinces = (req, res) => res.send(PROVINCES);
