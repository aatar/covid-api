/* eslint-disable complexity */
/* eslint-disable indent */
/* eslint-disable id-length */
/* eslint-disable no-extra-parens */
/* eslint-disable no-nested-ternary */
const csv = require('csvtojson');
// const csv = require('csv-parser');
const fs = require('fs');
const request = require('request');
const logger = require('../logger');
const { CovidCases } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { PROVINCES } = require('./constants');

exports.readCsv = async (req, res) => {
  await CovidCases.destroy({
    where: {},
    truncate: true
  });
  await csv()
    .fromStream(request.get('https://sisa.msal.gov.ar/datos/descargas/covid-19/files/Covid19Casos.csv'))
    .subscribe(
      json => {
        logger.info(json);
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
      },
      null,
      null
    );
  return res.send('OK');
};

exports.readCsv2 = (req, res) => {
  const results = [];

  fs.createReadStream('Covid19Casos.csv')
    .pipe(csv())
    .on('data', data => results.push(data))
    .on('end', () => res.send(results));
};

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
  const { deaths } = req.query;
  const stats = await CovidCases.findAll({
    where: { fallecido: { [Op.like]: deaths === 'true' ? 'SI' : '%' } },
    attributes: ['residencia_provincia_nombre', [Sequelize.fn('COUNT', Sequelize.col('id')), 'cantidad']],
    group: 'residencia_provincia_nombre'
  });
  return res.send(stats);
};

exports.lastUpdate = async (req, res) => {
  const covidCase = await CovidCases.findOne({
    where: {}
  });
  return res.send({ last_update: covidCase.ultima_actualizacion });
};

exports.provinces = (req, res) => res.send(PROVINCES);
