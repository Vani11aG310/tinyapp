const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');

// set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


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

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "a@a.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "b@b.com",
    password: "5678",
  },
};

function generateRandomString() {
  let string = '';
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let counter = 0; counter < length; counter++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
}

function findUserByEmail(email) {
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }
  return foundUser;
}

function urlsForUser(id) {
  const userURLs = {};

  for (const urlKey in urlDatabase) {
    if (urlDatabase[urlKey].userID === id) {
      userURLs[urlKey] = { longURL: urlDatabase[urlKey].longURL, userID: urlDatabase[urlKey].userID}
    }
  }

  return userURLs;
}

app.get('/', (req, res) => {
  res.send('Hello!');
});


app.get('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send('You must be logged in to see your short URLs');
  }

  const urls = urlsForUser(req.cookies['user_id'])

  const templateVars = { urls, user: users[req.cookies["user_id"]] };
  res.render('urls_index', templateVars);
});

app.get('/login', (req, res) => {
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('login', templateVars);
});

app.post('/login', (req, res) => {
  // check users for existing user
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }

  let user = null;

  if (findUserByEmail(email)) {
    if (password === findUserByEmail(email).password) {
      user = findUserByEmail(email);
    }
  }

  if (!user) {
    return res.status(400).send('User with that email does not exist');
  }


  res.cookie("user_id", user.id);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});

app.get('/register', (req, res) => {
  if (req.cookies['user_id']) {
    return res.redirect('/urls');
  }
  const templateVars = { user: users[req.cookies['user_id']] };
  res.render('register', templateVars);
});

app.post('/register', (req, res) => {
  const userId = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send('Please provide an email AND a password');
  }

  // check for existing user

  if (findUserByEmail(email)) {
    return res.status(400).send('User with that email already exists');
  }

  users[userId] = { id: userId, email, password };

  res.cookie('user_id', userId);

  res.redirect('urls');

});

app.post('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send('Cannot shorten URLs becasue you are not logged in.')
  }
  const newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: req.body.longURL, userID: req.cookies['user_id']};
  res.redirect(`/urls/${newKey}`);
});

app.get('/u/:id', (req, res) => {
  if (!Object.keys(urlDatabase).includes(req.params.id)) {
    return res.send("That shortURL does not exist");
  }
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get('/urls/new', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.redirect('/login');
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  if (!req.cookies['user_id']) {
    return res.send('You must be logged in to see your shortURL')
  }

  if (urlDatabase[req.params.id].userID !== req.cookies['user_id']) {
    res.status(401).send('You are not authorized to view this shortURL');
  }
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL, user: users[req.cookies["user_id"]] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  if (req.cookies['user_id'] !== urlDatabase[req.params.id].userID || !req.cookies['user_id']) {
    return res.status(401).send('You are not authorized to make changes to this shortURL');
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send('That shortURL does not exist');
  }
  urlDatabase[req.params.id].longURL = req.body.longURL;
  res.redirect('/urls');
});

app.post('/urls/:id/delete', (req, res) => {
  if (req.cookies['user_id'] !== urlDatabase[req.params.id].userID || !req.cookies['user_id']) {
    return res.status(401).send('You are not authorized to make changes to this shortURL');
  }
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send('That shortURL does not exist');
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});