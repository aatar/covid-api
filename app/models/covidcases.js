/* eslint-disable id-length */
/* eslint-disable new-cap */
/* eslint-disable no-empty-function */

/*
 * La columna 'id_evento_caso' debería ser clave primaria, pero se quitó la
 * restricción debido a que el dataset del gobierno está mal-formado y puede
 * contener claves duplicadas.
 */

module.exports = (sequelize, Sequelize) => {
  const CovidCases = sequelize.define(
    'CovidCases',
    {
      id_evento_caso: {
        type: Sequelize.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      sexo: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      edad: {
        type: Sequelize.STRING(8),
        defaultValue: '0',
        allowNull: true
      },
      edad_anios_meses: {
        type: Sequelize.STRING(8),
        allowNull: true
      },
      residencia_pais_nombre: {
        type: Sequelize.STRING(48),
        allowNull: true
      },
      residencia_provincia_nombre: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      residencia_departamento_nombre: {
        type: Sequelize.STRING(64),
        allowNull: true
      },
      carga_provincia_nombre: {
        type: Sequelize.STRING(32),
        allowNull: true
      },
      fecha_inicio_sintomas: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      fecha_apertura: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      sepi_apertura: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      fecha_internacion: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      cuidado_intensivo: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      fecha_cui_intensivo: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      fallecido: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      fecha_fallecimiento: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      asistencia_respiratoria_mecanica: {
        type: Sequelize.STRING(4),
        allowNull: true
      },
      carga_provincia_id: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      origen_financiamiento: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      clasificacion: {
        type: Sequelize.STRING(128),
        allowNull: true
      },
      clasificacion_resumen: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      residencia_provincia_id: {
        type: Sequelize.STRING(2),
        allowNull: true
      },
      fecha_diagnostico: {
        type: Sequelize.STRING(16),
        allowNull: true
      },
      residencia_departamento_id: {
        type: Sequelize.STRING(3),
        allowNull: true
      },
      ultima_actualizacion: {
        type: Sequelize.STRING(16),
        allowNull: true
      }
    },
    {
      timestamps: false,
      indexes: [
        {
          name: 'CountIndex',
          unique: false,
          fields: [
            'fallecido',
            'clasificacion_resumen',
            'cuidado_intensivo',
            'asistencia_respiratoria_mecanica',
            'fecha_apertura'
          ]
        },
        {
          name: 'ProvinceCountIndex',
          unique: false,
          fields: [
            'carga_provincia_nombre',
            'fallecido',
            'clasificacion_resumen',
            'cuidado_intensivo',
            'asistencia_respiratoria_mecanica',
            'fecha_apertura'
          ]
        },
        {
          name: 'ProvinceStatsIndex',
          unique: false,
          fields: ['carga_provincia_nombre', 'fallecido', 'clasificacion_resumen', 'id_evento_caso']
        },
        {
          name: 'ProvinceSummaryIndex',
          unique: false,
          fields: [
            'carga_provincia_nombre',
            'fallecido',
            'clasificacion_resumen',
            'cuidado_intensivo',
            'asistencia_respiratoria_mecanica',
            'fecha_apertura',
            'id_evento_caso'
          ]
        },
        {
          name: 'RawSummaryIndex',
          unique: false,
          fields: ['fecha_apertura', 'id_evento_caso']
        },
        {
          name: 'StatsIndex',
          unique: false,
          fields: ['fallecido', 'clasificacion_resumen', 'carga_provincia_nombre', 'id_evento_caso']
        },
        {
          name: 'SummaryIndex',
          unique: false,
          fields: [
            'fallecido',
            'clasificacion_resumen',
            'cuidado_intensivo',
            'asistencia_respiratoria_mecanica',
            'fecha_apertura',
            'id_evento_caso'
          ]
        }
      ]
    }
  );
  // Este modelo no posee una columna 'id':
  CovidCases.removeAttribute('id');
  CovidCases.associate = () => {};
  return CovidCases;
};
