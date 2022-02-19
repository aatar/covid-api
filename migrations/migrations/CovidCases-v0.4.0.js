/* eslint-disable no-unused-vars */

'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => queryInterface.removeConstraint('CovidCases', 'CovidCases_pkey'),

  down: (queryInterface, Sequelize) =>
    queryInterface.addConstraint('CovidCases', ['id_evento_caso'], {
      type: 'primary key',
      name: 'CovidCases_pkey'
    })
};
