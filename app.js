const express = require('express');
const mysql = require('mysql2');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

dotenv.config({ path: '.env' });
const publicDir = path.join(__dirname, './public');

const app = express();
app.set('view engine', 'hbs');
app.use(express.static(publicDir));
app.use(express.urlencoded({ extended: 'false' }));
app.use(express.json());

const db = mysql.createConnection({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE,
});

db.connect((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('MYSQL connected!');
  }
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);

  hashedPassword = await bcrypt.hash(password, 8);
  console.log(hashedPassword);

  db.query(
    'SELECT email from users where email = ? AND password = ?',
    [email, password],
    (error, result) => {
      console.log(result);
      console.log(error);
      if (error) {
        console.log('ERROR FOUND!!');
        console.log(error);
      }
      if (result.length == 0) {
        return res.render('login', {
          message: "Email password combination doesn't match",
        });
      }
    }
  );
});

app.post('/auth/register', (req, res) => {
  console.log(req.body);
  const { name, email, password, passwordConfirm } = req.body;
  console.log(password, passwordConfirm);
  db.query(
    'SELECT email from users where email = ?',
    [email],
    async (error, result) => {
      if (error) {
        console.log(error);
      }

      if (result.length > 0) {
        return res.render('register', {
          message: 'This email is already in use.',
        });
      } else if (password !== passwordConfirm) {
        return res.render('register', {
          message: "Passwords don't match",
        });
      }

      let hashedPassword = await bcrypt.hash(password, 8);
      db.query(
        'INSERT INTO users SET?',
        {
          name: name,
          email: email,
          password: hashedPassword,
        },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            return res.render('register', { message: 'User registered..!!' });
          }
        }
      );
    }
  );
});

app.listen(5001, () => {
  console.log('server started on port 5000');
});
