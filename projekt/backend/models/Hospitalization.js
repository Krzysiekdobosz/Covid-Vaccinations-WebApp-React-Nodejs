// models/Hospitalization.js
module.exports = (sequelize, DataTypes) => {
    const Hospitalization = sequelize.define('Hospitalization', {
      entity: DataTypes.STRING,
      iso_code: DataTypes.STRING,
      date: DataTypes.DATE,
      indicator: DataTypes.STRING,
      value: DataTypes.FLOAT
    });
    return Hospitalization;
  };