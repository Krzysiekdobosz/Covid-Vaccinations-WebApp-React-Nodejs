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
      // Pobieramy zapytanie od użytkownika z parametrami atrybutów i numerem strony
      const selectedAttributes = req.query.attributes || [];
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 100; // Domyślny rozmiar strony: 100
  
      // Obliczamy ofset na podstawie numeru strony i rozmiaru strony
      const offset = (page - 1) * pageSize;
      
      // Jeśli nie wybrano żadnych atrybutów, zwracamy wszystkie
      const attributesToSelect = selectedAttributes.length > 0 ? selectedAttributes : Object.keys(Vaccination.rawAttributes);
  
      // Pobieramy dane z bazy danych, wybierając tylko wybrane atrybuty i uwzględniając paginację
      const data = await Vaccination.findAll({
        attributes: attributesToSelect,
        limit: pageSize,
        offset: offset
      });
  
      res.json(data);
    } catch (error) {
      console.error('Błąd podczas pobierania danych:', error);
      res.status(500).send('Wystąpił błąd podczas pobierania danych.');
    }
});
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

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});
