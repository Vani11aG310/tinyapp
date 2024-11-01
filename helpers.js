const findUserByEmail = (email, database) => {
  for (const userId in database) {
    const user = database[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const urlsForUser = (id, database) => {
  const userURLs = {};

  for (const urlKey in database) {
    if (database[urlKey].userID === id) {
      userURLs[urlKey] = database[urlKey];
    }
  }
  return userURLs;
};

module.exports = { findUserByEmail, urlsForUser };