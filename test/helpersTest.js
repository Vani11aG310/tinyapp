const { assert } = require("chai");

const { findUserByEmail } = require('../helpers');

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
    const user = findUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    // Write your assert statement here
    assert.equal(user.id, expectedUserID);
  });
  it('should return undefined with an email that doesn\'t exist in the database', function() {
    const user = findUserByEmail("test@example.com", testUsers);
    const expectedResult = undefined;
    assert.equal(user, expectedResult);
  })
});