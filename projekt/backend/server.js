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
const CHUNK_SIZE = 500; // Ustal wielkość porcji danych

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
          resolve('Dane zostały pomyślnie zapisane do bazy danych.');
        } catch (error) {
          reject(error);
        }
      });
  });
};



/// pobranie juz z mysql vaccinations 
const Vaccination = require('./models/Vaccination')(sequelize, require('sequelize').DataTypes);



app.use(cors());
app.use(bodyParser.json());
// Aktualizacja endpointu /data, aby zwracał paginowane wyniki



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
    console.error('Błąd podczas pobierania danych:', error);
    res.status(500).send('Wystąpił błąd podczas pobierania danych.');
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
    console.error('Błąd podczas pobierania krajów:', error);
    res.status(500).send('Wystąpił błąd podczas pobierania krajów.');
  }
});


//próba pobrania wszystkich danych

app.get('/dataall', async (req, res) => {
  try {
    let selectedCountry = req.query.country || 'Poland'; // Domyślnie wybieramy Polskę
    const data = await Vaccination.findAll({
      where: {
        location: selectedCountry
      },
      attributes: [
        'location',
        [sequelize.fn('sum', sequelize.col('total_vaccinations')), 'total_vaccinations'],
        [sequelize.fn('sum', sequelize.col('people_vaccinated')), 'people_vaccinated'],
        [sequelize.fn('sum', sequelize.col('people_fully_vaccinated')), 'people_fully_vaccinated'],
        [sequelize.fn('sum', sequelize.col('total_boosters')), 'total_boosters'],
        [sequelize.fn('avg', sequelize.col('daily_vaccinations_raw')), 'avg_daily_vaccinations_raw'],
        [sequelize.fn('avg', sequelize.col('daily_vaccinations')), 'avg_daily_vaccinations'],
        [sequelize.fn('avg', sequelize.col('total_vaccinations_per_hundred')), 'avg_total_vaccinations_per_hundred'],
        [sequelize.fn('avg', sequelize.col('people_vaccinated_per_hundred')), 'avg_people_vaccinated_per_hundred'],
        [sequelize.fn('avg', sequelize.col('people_fully_vaccinated_per_hundred')), 'avg_people_fully_vaccinated_per_hundred'],
        [sequelize.fn('avg', sequelize.col('total_boosters_per_hundred')), 'avg_total_boosters_per_hundred'],
        [sequelize.fn('avg', sequelize.col('daily_vaccinations_per_million')), 'avg_daily_vaccinations_per_million'],
        [sequelize.fn('avg', sequelize.col('daily_people_vaccinated')), 'avg_daily_people_vaccinated'],
        [sequelize.fn('avg', sequelize.col('daily_people_vaccinated_per_hundred')), 'avg_daily_people_vaccinated_per_hundred']
      ]
    });

    if (!data) {
      return res.status(404).send('Brak danych dla wybranego kraju.');
    }

    // Zwracamy tylko pierwszy rekord, ponieważ wszystkie wartości są zsumowane w jednym wierszu
    const averagedData = {
      ...data[0].dataValues,
      avg_daily_vaccinations_raw: data[0].dataValues.avg_daily_vaccinations_raw / data.length,
      avg_daily_vaccinations: data[0].dataValues.avg_daily_vaccinations / data.length,
      avg_total_vaccinations_per_hundred: data[0].dataValues.avg_total_vaccinations_per_hundred / data.length,
      avg_people_vaccinated_per_hundred: data[0].dataValues.avg_people_vaccinated_per_hundred / data.length,
      avg_people_fully_vaccinated_per_hundred: data[0].dataValues.avg_people_fully_vaccinated_per_hundred / data.length,
      avg_total_boosters_per_hundred: data[0].dataValues.avg_total_boosters_per_hundred / data.length,
      avg_daily_vaccinations_per_million: data[0].dataValues.avg_daily_vaccinations_per_million / data.length,
      avg_daily_people_vaccinated: data[0].dataValues.avg_daily_people_vaccinated / data.length,
      avg_daily_people_vaccinated_per_hundred: data[0].dataValues.avg_daily_people_vaccinated_per_hundred / data.length
    };

    res.json(averagedData);
  } catch (error) {
    console.error('Błąd podczas pobierania danych:', error);
    res.status(500).send('Wystąpił błąd podczas pobierania danych.');
  }
});



//


// Endpoint do przesyłania pliku CSV
app.post('/upload', async (req, res) => {
  try {
    const { fileName } = req.body; // Odbieramy nazwę pliku z żądania
    const filePath = path.join(__dirname, 'data', fileName); // Tworzymy ścieżkę do pliku

    const message = await uploadCsv(filePath, Vaccination);
    res.status(200).send(message);
  } catch (error) {
    console.error('Błąd podczas przetwarzania pliku CSV:', error);
    res.status(500).send('Wystąpił błąd podczas przetwarzania pliku CSV.');
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the backend!');
});

// Rejestracja użytkownika
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

// Logowanie użytkownika
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

//
///pobieranie wykresy
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














////
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
