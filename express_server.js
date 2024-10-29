const express = require('express');
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
// set up middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// set view engine
app.set('view engine', 'ejs');

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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

app.get('/', (req, res) => {
  res.send('Hello!');
});


app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render('urls_index', templateVars);
});

app.post('/login', (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  const newKey = generateRandomString();
  urlDatabase[newKey] = req.body.longURL;
  res.redirect(`/urls/${newKey}`);
});

app.get('/u/:id', (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
})

app.get('/urls/new', (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render('urls_new', templateVars);
});

app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["username"] };
  res.render('urls_show', templateVars);
});

app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls')
});

app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
})

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});