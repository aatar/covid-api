/* eslint-disable complexity */
/* eslint-disable indent */
/* eslint-disable id-length */
/* eslint-disable no-extra-parens */
/* eslint-disable no-nested-ternary */
/* eslint-disable max-lines */
/* eslint-disable max-len */
const { CovidCases } = require('../models');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const { PROVINCES } = require('./constants');

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
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'count']]
  });
  return res.send(count);
};

exports.stats = async (req, res) => {
  const provinceCases = await CovidCases.findAll({
    attributes: [
      ['residencia_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'residencia_provincia_nombre',
    order: [['residencia_provincia_nombre', 'ASC']]
  });
  const provinceDeaths = await CovidCases.findAll({
    where: { fallecido: { [Op.eq]: 'SI' } },
    attributes: [
      ['residencia_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'residencia_provincia_nombre',
    order: [['residencia_provincia_nombre', 'ASC']]
  });

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
  if (covidCase) {
    return res.send({ last_update: covidCase.ultima_actualizacion });
  }
  return res.send({
    error: 'EmptyDataset',
    message: "Cant't get a single record and his last update date because the dataset is empty."
  });
};

exports.provinces = (req, res) => res.send(PROVINCES);
