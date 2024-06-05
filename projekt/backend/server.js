const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const sequelize = require('./config');
const User = require('./models/User');

const { exec } = require('child_process');

const { Op } = require('sequelize');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const CHUNK_SIZE = 500;

const uploadCsv = async (filePath, Model) => {
  const results = [];
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          for (let i = 0; i < results.length; i += CHUNK_SIZE) {
            const chunk = results.slice(i, i + CHUNK_SIZE);
            await Model.bulkCreate(chunk);
          }
          resolve('Data successfully saved to the database.');
        } catch (error) {
          reject(error);
        }
      });
  });
};

const Vaccination = require('./models/Vaccination')(sequelize, require('sequelize').DataTypes);

app.get('/data', async (req, res) => {
  try {
    const selectedAttributes = req.query.attributes || [];
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    const countries = req.query.countries || [];
    const offset = (page - 1) * pageSize;
    const attributesToSelect = selectedAttributes.length > 0 ? selectedAttributes : Object.keys(Vaccination.rawAttributes);

    const whereCondition = countries.length > 0 ? { location: countries } : {};
    
    const data = await Vaccination.findAll({
      attributes: attributesToSelect,
      where: whereCondition,
      limit: pageSize,
      offset: offset
    });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred while fetching data.');
  }
});

app.get('/countries', async (req, res) => {
  try {
    const countries = await Vaccination.findAll({
      attributes: ['location'],
      group: ['location']
    });
    res.json(countries.map(country => country.location));
  } catch (error) {
    console.error('Error fetching countries:', error);
    res.status(500).send('An error occurred while fetching countries.');
  }
});
app.get('/dataall', async (req, res) => {
  try {
    const selectedCountries = req.query.countries || ['Poland']; // Początkowo wybieramy Polskę

    const dataPromises = selectedCountries.map(async (country) => {
      const countryData = await Vaccination.findAll({
        where: { location: country }
      });

      if (!countryData || countryData.length === 0) {
        return null;
      }

      const sortedData = countryData.sort((a, b) => new Date(a.date) - new Date(b.date));
      const latestData = sortedData[sortedData.length - 1];

      const averages = sortedData.reduce(
        (acc, record) => {
          acc.daily_vaccinations_raw += record.daily_vaccinations_raw || 0;
          acc.daily_vaccinations += record.daily_vaccinations || 0;
          acc.total_vaccinations_per_hundred += record.total_vaccinations_per_hundred || 0;
          acc.people_vaccinated_per_hundred += record.people_vaccinated_per_hundred || 0;
          acc.people_fully_vaccinated_per_hundred += record.people_fully_vaccinated_per_hundred || 0;
          acc.total_boosters_per_hundred += record.total_boosters_per_hundred || 0;
          acc.daily_vaccinations_per_million += record.daily_vaccinations_per_million || 0;
          acc.daily_people_vaccinated += record.daily_people_vaccinated || 0;
          acc.daily_people_vaccinated_per_hundred += record.daily_people_vaccinated_per_hundred || 0;
          acc.count += 1;
          return acc;
        },
        {
          daily_vaccinations_raw: 0,
          daily_vaccinations: 0,
          total_vaccinations_per_hundred: 0,
          people_vaccinated_per_hundred: 0,
          people_fully_vaccinated_per_hundred: 0,
          total_boosters_per_hundred: 0,
          daily_vaccinations_per_million: 0,
          daily_people_vaccinated: 0,
          daily_people_vaccinated_per_hundred: 0,
          count: 0
        }
      );

      return {
        location: country,
        total_vaccinations: latestData.total_vaccinations,
        people_vaccinated: latestData.people_vaccinated,
        people_fully_vaccinated: latestData.people_fully_vaccinated,
        total_boosters: latestData.total_boosters,
        avg_daily_vaccinations_raw: averages.daily_vaccinations_raw / averages.count,
        avg_daily_vaccinations: averages.daily_vaccinations / averages.count,
        avg_total_vaccinations_per_hundred: averages.total_vaccinations_per_hundred / averages.count,
        avg_people_vaccinated_per_hundred: averages.people_vaccinated_per_hundred / averages.count,
        avg_people_fully_vaccinated_per_hundred: averages.people_fully_vaccinated_per_hundred / averages.count,
        avg_total_boosters_per_hundred: averages.total_boosters_per_hundred / averages.count,
        avg_daily_vaccinations_per_million: averages.daily_vaccinations_per_million / averages.count,
        avg_daily_people_vaccinated: averages.daily_people_vaccinated / averages.count,
        avg_daily_people_vaccinated_per_hundred: averages.daily_people_vaccinated_per_hundred / averages.count,
      };
    });

    const countryData = await Promise.all(dataPromises);
    res.json(countryData.filter(data => data !== null));
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).send('An error occurred while fetching data.');
  }
});
app.post('/upload', async (req, res) => {
  try {
    const { fileName } = req.body;
    const filePath = path.join(__dirname, 'data', fileName);

    const message = await uploadCsv(filePath, Vaccination);
    res.status(200).send(message);
  } catch (error) {
    console.error('Error processing CSV file:', error);
    res.status(500).send('An error occurred while processing the CSV file.');
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the backend!');
});

app.post('/register', [
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'User already exists or other error.' });
  }
});

app.post('/login', [
  body('username').isLength({ min: 3 }),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, 'secret_key', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
});

app.post('/generate-plot', (req, res) => {
  const { plotType } = req.body;
  const csvFilePath = path.join(__dirname, 'data', 'vaccinations.csv');
  const outputFilePath = path.join(__dirname, 'data', `vaccination_plot_${plotType}.png`);
  const scriptPath = path.join(__dirname, 'scripts', 'generate_plot.py');

  exec(`python ${scriptPath} ${csvFilePath} ${outputFilePath} ${plotType}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating plot: ${error.message}`);
      return res.status(500).send('Error generating plot');
    }

    res.json({ plotUrl: `http://localhost:5000/data/vaccination_plot_${plotType}.png` });
  });
});

app.use('/data', express.static(path.join(__dirname, 'data')));

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
