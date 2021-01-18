'use strict';
module.exports = (sequelize, Sequelize) => {
  const CovidCases = sequelize.define(
    'CovidCases',
    {
      id: { type: Sequelize.INTEGER, autoIncrement: true, allowNull: false, primaryKey: true },
      id_evento_caso: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sexo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      edad: {
        type: Sequelize.STRING,
        allowNull: true
      },
      edad_anios_meses: {
        type: Sequelize.STRING,
        allowNull: true
      },
      residencia_pais_nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      residencia_provincia_nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      residencia_departamento_nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      carga_provincia_nombre: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_inicio_sintomas: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_apertura: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sepi_apertura: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_internacion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      cuidado_intensivo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_cui_intensivo: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fallecido: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_fallecimiento: {
        type: Sequelize.STRING,
        allowNull: true
      },
      // eslint-disable-next-line id-length
      asistencia_respiratoria_mecanica: {
        type: Sequelize.STRING,
        allowNull: true
      },
      carga_provincia_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      origen_financiamiento: {
        type: Sequelize.STRING,
        allowNull: true
      },
      clasificacion: {
        type: Sequelize.STRING,
        allowNull: true
      },
      clasificacion_resumen: {
        type: Sequelize.STRING,
        allowNull: true
      },
      residencia_provincia_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      fecha_diagnostico: {
        type: Sequelize.STRING,
        allowNull: true
      },
      residencia_departamento_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      ultima_actualizacion: {
        type: Sequelize.STRING,
        allowNull: true
      }
    },
    {}
  );
  CovidCases.associate = () => {
    // associations can be defined here
  };
  return CovidCases;
};
