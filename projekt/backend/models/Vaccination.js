// models/Vaccination.js
module.exports = (sequelize, DataTypes) => {
    const Vaccination = sequelize.define('Vaccination', {
      location: DataTypes.STRING,
      iso_code: DataTypes.STRING,
      date: DataTypes.DATE,
      total_vaccinations: DataTypes.INTEGER,
      people_vaccinated: DataTypes.INTEGER,
      people_fully_vaccinated: DataTypes.INTEGER,
      total_boosters: DataTypes.INTEGER,
      daily_vaccinations_raw: DataTypes.INTEGER,
      daily_vaccinations: DataTypes.INTEGER,
      total_vaccinations_per_hundred: DataTypes.FLOAT,
      people_vaccinated_per_hundred: DataTypes.FLOAT,
      people_fully_vaccinated_per_hundred: DataTypes.FLOAT,
      total_boosters_per_hundred: DataTypes.FLOAT,
      daily_vaccinations_per_million: DataTypes.FLOAT,
      daily_people_vaccinated: DataTypes.INTEGER,
      daily_people_vaccinated_per_hundred: DataTypes.FLOAT
    });
    return Vaccination;
  };
  