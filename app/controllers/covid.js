/* eslint-disable max-lines */
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
const { PROVINCES, POBLATION } = require('./constants');

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

exports.provinceCases = async (req, res) => {
  const { icu, dead, respirator, classification, from, to } = req.query;
  const { slug } = req.params;
  const { province } = PROVINCES.filter(p => p.slug === slug)[0];
  const cases = await CovidCases.findAll({
    where: {
      carga_provincia_nombre: { [Op.eq]: province },
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
    attributes: { exclude: ['id_evento_caso'] }
  });
  return res.send(cases);
};

exports.provinceCount = async (req, res) => {
  const { icu, dead, respirator, classification, from, to } = req.query;
  const { slug } = req.params;
  const { province } = PROVINCES.filter(p => p.slug === slug)[0];
  const count = await CovidCases.find({
    where: {
      carga_provincia_nombre: { [Op.eq]: province },
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

exports.provinceStats = async (req, res) => {
  req.setTimeout(1000000000);
  const { slug } = req.params;
  const { province } = PROVINCES.filter(p => p.slug === slug)[0];
  const provinceCases = await CovidCases.find({
    where: {
      carga_provincia_nombre: { [Op.eq]: province },
      clasificacion_resumen: { [Op.eq]: 'Confirmado' }
    },
    attributes: [
      ['carga_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'carga_provincia_nombre'
  });
  const provinceDeaths = await CovidCases.find({
    where: {
      carga_provincia_nombre: { [Op.eq]: province },
      fallecido: { [Op.eq]: 'SI' },
      clasificacion_resumen: { [Op.eq]: 'Confirmado' }
    },
    attributes: [
      ['carga_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'carga_provincia_nombre'
  });
  const { poblacion } = POBLATION.filter(p => p.provincia === province)[0];

  const response = {
    provincia: provinceCases.dataValues.provincia,
    población: poblacion,
    muertes_por_millón: ((provinceDeaths.dataValues.cantidad * 1000000) / poblacion).toFixed(0),
    muertes_cada_cien_mil: ((provinceDeaths.dataValues.cantidad * 100000) / poblacion).toFixed(0),
    casos_por_millón: ((provinceCases.dataValues.cantidad * 1000000) / poblacion).toFixed(0),
    casos_cada_cien_mil: ((provinceCases.dataValues.cantidad * 100000) / poblacion).toFixed(0),
    letalidad: (provinceDeaths.dataValues.cantidad / provinceCases.dataValues.cantidad).toFixed(4)
  };
  return res.send(response);
};

exports.provinceSummary = async (req, res) => {
  req.setTimeout(1000000000);
  const { icu, dead, respirator, classification, from, to } = req.query;
  const { slug } = req.params;
  const { province } = PROVINCES.filter(p => p.slug === slug)[0];
  const dateCases = await CovidCases.findAll({
    where: {
      carga_provincia_nombre: { [Op.eq]: province },
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
    attributes: [
      ['fecha_apertura', 'fecha'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'fecha_apertura',
    order: [['fecha_apertura', 'ASC']]
  });
  const dateDeaths = await CovidCases.findAll({
    where: {
      carga_provincia_nombre: { [Op.eq]: province },
      cuidado_intensivo: icu ? (icu === 'true' ? { [Op.eq]: 'SI' } : { [Op.eq]: 'NO' }) : { [Op.like]: '%' },
      fallecido: { [Op.eq]: 'SI' },
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
    attributes: [
      ['fecha_apertura', 'fecha'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'fecha_apertura',
    order: [['fecha_apertura', 'ASC']]
  });

  const { poblacion } = POBLATION.filter(p => p.provincia === province)[0];

  let i1 = 0,
    i2 = 0,
    muertes_acum = 0,
    casos_acum = 0;
  let response = [];

  while (i1 < dateCases.length && i2 < dateDeaths.length) {
    const deaths = dateDeaths[i2].dataValues.cantidad;
    const cases = dateCases[i1].dataValues.cantidad;

    casos_acum += parseInt(cases, 10);

    if (dateCases[i1].dataValues.fecha === dateDeaths[i2].dataValues.fecha) {
      muertes_acum += parseInt(deaths, 10);

      response = [
        ...response,
        {
          index: i1,
          fecha: dateCases[i1].dataValues.fecha,
          casos: cases,
          muertes: deaths,
          muertes_acum,
          casos_acum,
          muertes_por_millón: ((deaths * 1000000) / poblacion).toFixed(0),
          muertes_acum_por_millón: ((muertes_acum * 1000000) / poblacion).toFixed(0),
          muertes_cada_cien_mil: ((deaths * 100000) / poblacion).toFixed(0),
          muertes_acum_cada_cien_mil: ((muertes_acum * 100000) / poblacion).toFixed(0),
          casos_por_millón: ((cases * 1000000) / poblacion).toFixed(0),
          casos_acum_por_millón: ((casos_acum * 1000000) / poblacion).toFixed(0),
          casos_cada_cien_mil: ((cases * 100000) / poblacion).toFixed(0),
          casos_acum_cada_cien_mil: ((casos_acum * 100000) / poblacion).toFixed(0)
        }
      ];
      i1 += 1;
      i2 += 1;
    } else {
      response = [
        ...response,
        {
          index: i1,
          fecha: dateCases[i1].dataValues.fecha,
          casos: cases,
          muertes: 0,
          muertes_acum,
          casos_acum,
          muertes_por_millón: ((deaths * 1000000) / poblacion).toFixed(0),
          muertes_acum_por_millón: ((muertes_acum * 1000000) / poblacion).toFixed(0),
          muertes_cada_cien_mil: ((deaths * 100000) / poblacion).toFixed(0),
          muertes_acum_cada_cien_mil: ((muertes_acum * 100000) / poblacion).toFixed(0),
          casos_por_millón: ((cases * 1000000) / poblacion).toFixed(0),
          casos_acum_por_millón: ((casos_acum * 1000000) / poblacion).toFixed(0),
          casos_cada_cien_mil: ((cases * 100000) / poblacion).toFixed(0),
          casos_acum_cada_cien_mil: ((casos_acum * 100000) / poblacion).toFixed(0)
        }
      ];
      i1 += 1;
    }
  }
  // eslint-disable-next-line dot-notation
  return res.send(response);
};

exports.stats = async (req, res) => {
  req.setTimeout(1000000000);
  let provinceCases = await CovidCases.findAll({
    where: {
      clasificacion_resumen: { [Op.eq]: 'Confirmado' }
    },
    attributes: [
      ['carga_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'carga_provincia_nombre',
    order: [['carga_provincia_nombre', 'ASC']]
  });
  const countryCases = await CovidCases.find({
    where: {
      clasificacion_resumen: { [Op.eq]: 'Confirmado' }
    },
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']]
  });
  let provinceDeaths = await CovidCases.findAll({
    where: { fallecido: { [Op.eq]: 'SI' }, clasificacion_resumen: { [Op.eq]: 'Confirmado' } },
    attributes: [
      ['carga_provincia_nombre', 'provincia'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'carga_provincia_nombre',
    order: [['carga_provincia_nombre', 'ASC']]
  });
  const countryDeaths = await CovidCases.find({
    where: { fallecido: { [Op.eq]: 'SI' }, clasificacion_resumen: { [Op.eq]: 'Confirmado' } },
    attributes: [[Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']]
  });
  const poblation = POBLATION;

  provinceCases = provinceCases.filter(province => province.dataValues.provincia !== 'SIN ESPECIFICAR');
  provinceDeaths = provinceDeaths.filter(province => province.dataValues.provincia !== 'SIN ESPECIFICAR');

  let i1 = 0,
    i2 = 0;
  let response = [
    {
      provincia: 'Argentina',
      población: poblation[0].poblacion,
      muertes_por_millón: ((countryDeaths.dataValues.cantidad * 1000000) / poblation[0].poblacion).toFixed(0),
      muertes_cada_cien_mil: ((countryDeaths.dataValues.cantidad * 100000) / poblation[0].poblacion).toFixed(
        0
      ),
      casos_por_millón: ((countryCases.dataValues.cantidad * 1000000) / poblation[0].poblacion).toFixed(0),
      casos_cada_cien_mil: ((countryCases.dataValues.cantidad * 100000) / poblation[0].poblacion).toFixed(0),
      letalidad: (provinceDeaths[i2].dataValues.cantidad / provinceCases[i1].dataValues.cantidad).toFixed(4)
    }
  ];

  while (i1 < provinceCases.length && i2 < provinceDeaths.length) {
    response = [
      ...response,
      {
        provincia: provinceCases[i1].dataValues.provincia,
        población: poblation[i1 + 1].poblacion,
        muertes_por_millón: (
          (provinceDeaths[i2].dataValues.cantidad * 1000000) /
          poblation[i1 + 1].poblacion
        ).toFixed(0),
        muertes_cada_cien_mil: (
          (provinceDeaths[i2].dataValues.cantidad * 100000) /
          poblation[i1 + 1].poblacion
        ).toFixed(0),
        casos_por_millón: (
          (provinceCases[i1].dataValues.cantidad * 1000000) /
          poblation[i1 + 1].poblacion
        ).toFixed(0),
        casos_cada_cien_mil: (
          (provinceCases[i1].dataValues.cantidad * 100000) /
          poblation[i1 + 1].poblacion
        ).toFixed(0),
        letalidad: (provinceDeaths[i2].dataValues.cantidad / provinceCases[i1].dataValues.cantidad).toFixed(4)
      }
    ];
    i1 += 1;
    i2 += 1;
  }
  // eslint-disable-next-line dot-notation
  return res.send(response);
};

exports.summary = async (req, res) => {
  const { icu, dead, respirator, classification, from, to } = req.query;
  const dateCases = await CovidCases.findAll({
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
    attributes: [
      ['fecha_apertura', 'fecha'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'fecha_apertura',
    order: [['fecha_apertura', 'ASC']]
  });
  const dateDeaths = await CovidCases.findAll({
    where: {
      cuidado_intensivo: icu ? (icu === 'true' ? { [Op.eq]: 'SI' } : { [Op.eq]: 'NO' }) : { [Op.like]: '%' },
      fallecido: { [Op.eq]: 'SI' },
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
    attributes: [
      ['fecha_apertura', 'fecha'],
      [Sequelize.fn('COUNT', Sequelize.col('id_evento_caso')), 'cantidad']
    ],
    group: 'fecha_apertura',
    order: [['fecha_apertura', 'ASC']]
  });

  const poblation = POBLATION;

  let i1 = 0,
    i2 = 0,
    muertes_acum = 0,
    casos_acum = 0;
  let response = [];

  while (i1 < dateCases.length && i2 < dateDeaths.length) {
    const deaths = dateDeaths[i2].dataValues.cantidad;
    const cases = dateCases[i1].dataValues.cantidad;

    casos_acum += parseInt(cases, 10);

    if (dateCases[i1].dataValues.fecha === dateDeaths[i2].dataValues.fecha) {
      muertes_acum += parseInt(deaths, 10);

      response = [
        ...response,
        {
          index: i1,
          fecha: dateCases[i1].dataValues.fecha,
          casos: cases,
          muertes: deaths,
          muertes_acum,
          casos_acum,
          muertes_por_millón: ((deaths * 1000000) / poblation[0].poblacion).toFixed(0),
          muertes_acum_por_millón: ((muertes_acum * 1000000) / poblation[0].poblacion).toFixed(0),
          muertes_cada_cien_mil: ((deaths * 100000) / poblation[0].poblacion).toFixed(0),
          muertes_acum_cada_cien_mil: ((muertes_acum * 100000) / poblation[0].poblacion).toFixed(0),
          casos_por_millón: ((cases * 1000000) / poblation[0].poblacion).toFixed(0),
          casos_acum_por_millón: ((casos_acum * 1000000) / poblation[0].poblacion).toFixed(0),
          casos_cada_cien_mil: ((cases * 100000) / poblation[0].poblacion).toFixed(0),
          casos_acum_cada_cien_mil: ((casos_acum * 100000) / poblation[0].poblacion).toFixed(0)
        }
      ];
      i1 += 1;
      i2 += 1;
    } else {
      response = [
        ...response,
        {
          index: i1,
          fecha: dateCases[i1].dataValues.fecha,
          casos: cases,
          muertes: 0,
          muertes_acum,
          casos_acum,
          muertes_por_millón: ((deaths * 1000000) / poblation[0].poblacion).toFixed(0),
          muertes_acum_por_millón: ((muertes_acum * 1000000) / poblation[0].poblacion).toFixed(0),
          muertes_cada_cien_mil: ((deaths * 100000) / poblation[0].poblacion).toFixed(0),
          muertes_acum_cada_cien_mil: ((muertes_acum * 100000) / poblation[0].poblacion).toFixed(0),
          casos_por_millón: ((cases * 1000000) / poblation[0].poblacion).toFixed(0),
          casos_acum_por_millón: ((casos_acum * 1000000) / poblation[0].poblacion).toFixed(0),
          casos_cada_cien_mil: ((cases * 100000) / poblation[0].poblacion).toFixed(0),
          casos_acum_cada_cien_mil: ((casos_acum * 100000) / poblation[0].poblacion).toFixed(0)
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
