'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('vaccinations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      location: {
        type: Sequelize.STRING
      },
      iso_code: {
        type: Sequelize.STRING
      },
      date: {
        type: Sequelize.DATE
      },
      total_vaccinations: {
        type: Sequelize.INTEGER
      },
      people_vaccinated: {
        type: Sequelize.INTEGER
      },
      people_fully_vaccinated: {
        type: Sequelize.INTEGER
      },
      total_boosters: {
        type: Sequelize.INTEGER
      },
      daily_vaccinations_raw: {
        type: Sequelize.INTEGER
      },
      daily_vaccinations: {
        type: Sequelize.INTEGER
      },
      total_vaccinations_per_hundred: {
        type: Sequelize.FLOAT
      },
      people_vaccinated_per_hundred: {
        type: Sequelize.FLOAT
      },
      people_fully_vaccinated_per_hundred: {
        type: Sequelize.FLOAT
      },
      total_boosters_per_hundred: {
        type: Sequelize.FLOAT
      },
      daily_vaccinations_per_million: {
        type: Sequelize.FLOAT
      },
      daily_people_vaccinated: {
        type: Sequelize.INTEGER
      },
      daily_people_vaccinated_per_hundred: {
        type: Sequelize.FLOAT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vaccinations');
  }
};
