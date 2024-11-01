const express = require('express');
const app = express();
const PORT = 8080;
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { findUserByEmail, urlsForUser } = require('./helpers');

// set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['asdlkjhasdasd'],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));


// set view engine
app.set('view engine', 'ejs');

// Application databases
const urlDatabase = {
  sgq3y6: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ481W",
  },
  i3BoGr: {
    longURL: "http://www.google.com",
    userID: "aj481W",
  },
};

const users = {};

const generateRandomString = () => {
  let string = '';
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let counter = 0; counter < length; counter++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
};

app.get('/', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  res.redirect('/urls');
});

// renders list of shortURLs based on userID
app.get('/urls', (req, res) => {
  if (!req.session.userId) {
    return res.send('You must be logged in to see your short URLs');
  }

  const urls = urlsForUser(req.session.userId, urlDatabase);

  const templateVars = { urls, user: users[req.session.userId] };
  res.render('urls_index', templateVars);
});

// renders login page
app.get('/login', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.userId] };
  res.render('login', templateVars);
});

// runs login checks to login the user based on their input
app.post('/login', (req, res) => {
  // check users for existing user
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }

  let user = null;

  const foundUser = findUserByEmail(email, users);

  if (foundUser) {
    if (bcrypt.compareSync(password, foundUser.password)) {
      user = foundUser;
    }
  }

  if (!user) {
    return res.status(400).send('User with that email does not exist');
  }


  req.session.userId = user.id;
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// renders register page
app.get('/register', (req, res) => {
  if (req.session.userId) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.session.userId] };
  res.render('register', templateVars);
});

// Adds user to the database upon registration
app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }

  // check for existing user

  const foundUser = findUserByEmail(email, users);

  if (foundUser) {
    return res.status(400).send('User with that email already exists');
  }

  const salt = bcrypt.genSaltSync(10);

  const hashedPassword = bcrypt.hashSync(password, salt);

  users[userId] = { id: userId, email, password: hashedPassword };

  req.session.userId = userId;

  res.redirect('/urls');

});

// Route to add a shortURL to the database
app.post('/urls', (req, res) => {
  if (!req.session.userId) {
    return res.send('Cannot shorten URLs becasue you are not logged in.');
  }
  const newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: req.body.longURL, userID: req.session.userId };
  res.redirect(`/urls/${newKey}`);
});

// Route to redirect shortURL to the longURL
app.get('/u/:id', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send("That shortURL does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

// Renders new shortURL creation page
app.get('/urls/new', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  const templateVars = { user: users[req.session.userId] };
  res.render('urls_new', templateVars);
});

// Renders page displaying a user's specific shortURL
app.get('/urls/:id', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.status(400).send('That shortURL does not exist');
  }

  if (!req.session.userId) {
    return res.send('You must be logged in to see your shortURL');
  }

  if (urlDatabase[req.params.id].userID !== req.session.userId) {
    return res.status(401).send('You are not authorized to view this shortURL');
  }

  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.session.userId] };
  res.render('urls_show', templateVars);
});

// Route to update specific shortURL
app.post('/urls/:id', (req, res) => {
  if (req.session.userId !== urlDatabase[req.params.id].userID || !req.session.userId) {
    return res.status(401).send('You are not authorized to make changes to this shortURL');
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send('That shortURL does not exist');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

// Delete a shortURL
app.post('/urls/:id/delete', (req, res) => {
  if (req.session.userId !== urlDatabase[req.params.id].userID || !req.session.userId) {
    return res.status(401).send('You are not authorized to make changes to this shortURL');
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send('That shortURL does not exist');
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});