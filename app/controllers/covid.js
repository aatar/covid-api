const csv = require('csvtojson');
const request = require('request');
const logger = require('../logger');
const { CovidCases } = require('../models');

exports.readCsv = async (req, res) => {
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
