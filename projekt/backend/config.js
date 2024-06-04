// backend/config.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('coronadb', 'root', '', {
  host: 'localhost',
  dialect: 'mysql'
});

module.exports = sequelize;
