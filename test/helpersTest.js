const { assert } = require("chai");

const { findUserByEmail, urlsForUser } = require('../helpers');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('findUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined with an email that doesn\'t exist in the database', function() {
    const user = findUserByEmail("test@example.com", testUsers);
    const expectedResult = undefined;
    assert.equal(user, expectedResult);
  });

  describe('urlsForUser', function() {
    it('should return urls that belong to the specified user', function() {
      // Define test data
      const urlDatabase = {
        "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
        "9sm5xK": { longURL: "http://www.google.com", userID: "user2" },
        "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
      };

      // Define expected output
      const expectedOutput = {
        "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "user1" },
        "a1b2c3": { longURL: "http://www.example.com", userID: "user1" }
      };

      // Call the function with userId 'user1'
      const result = urlsForUser('user1', urlDatabase);

      // Assert that the result matches the expected output
      assert.deepEqual(result, expectedOutput);
    });
    it('should return an empty object if the user has no URLs', function() {
      const urlDatabase = {
        'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user123' },
        '9sm5xK': { longURL: 'http://www.google.com', userID: 'user456' },
        '4tkH2f': { longURL: 'http://www.example.com', userID: 'user123' }
      };
      const userId = 'user789'; // User with no URLs
      const expectedOutput = {};

      const result = urlsForUser(userId, urlDatabase);
      assert.deepEqual(result, expectedOutput);
    });
    it('should not return URLs that do not belong to the specified user', function() {
      const urlDatabase = {
        'b2xVn2': { longURL: 'http://www.lighthouselabs.ca', userID: 'user123' },
        '9sm5xK': { longURL: 'http://www.google.com', userID: 'user456' },
        '4tkH2f': { longURL: 'http://www.example.com', userID: 'user123' }
      };
      const userId = 'user123';
      const unexpectedURL = {
        '9sm5xK': { longURL: 'http://www.google.com', userID: 'user456' }
      };

      const result = urlsForUser(userId, urlDatabase);

      // Check that the result does not contain URLs belonging to user456
      assert.notDeepInclude(result, unexpectedURL);
    });
  });
});