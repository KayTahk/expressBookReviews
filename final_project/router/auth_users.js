const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    let userswithsamename = users.filter((user)=>{
      return user.username === username
    });
    if(userswithsamename.length > 0){
      return true;
    } else {
      return false;
    }
  }

const authenticatedUser = (username,password)=>{
  let validusers = users.filter((user)=>{
    return (user.username === username && user.password === password)
  });
  if(validusers.length > 0){
    return true;
  } else {
    return false;
  }
}

regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    req.session.authorization = {
      accessToken, username
    };

    return res.status(200).json({ message: "User successfully logged in." });
  } else {
    return res.status(401).json({ message: "Invalid login credentials." });
  }
});

//  Get book review
regd_users.post("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.body.review; // Get review text from the request body
    const username = req.session.authorization?.username; // Get username from the session
  
    if (!username) {
      return res.status(401).json({ message: "User not authenticated." });
    }
  
    const book = books[isbn];
  
    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }
  
    if (!reviewText) {
      return res.status(400).json({ message: "Review text is required." });
    }
  
    // Check if the user has already reviewed the book
    if (book.reviews[username]) {
      // User has reviewed before, update the review
      book.reviews[username] = reviewText;
      return res.status(200).json({ message: "Review updated successfully." });
    } else {
      // User has not reviewed before, add a new review
      book.reviews[username] = reviewText;
      return res.status(200).json({ message: "Review added successfully." });
    }
  });

  regd_users.delete("/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization?.username; // Get username from the session
    
    if (!username) {
        return res.status(401).json({ message: "User not authenticated." });
    }
    
    const book = books[isbn];
    
    if (!book) {
        return res.status(404).json({ message: "Book not found." });
    }
    
    // Check if the user has a review for the book
    if (book.reviews[username]) {
        // Delete the user's review
        delete book.reviews[username];
        return res.status(200).json({ message: "Review deleted successfully." });
    } else {
        return res.status(404).json({ message: "Review not found for the user." });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;

