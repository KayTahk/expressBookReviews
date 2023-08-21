const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login." });
        } else {
            return res.status(400).json({ message: "User already exists!" });
        }
    } else {
        return res.status(400).json({ message: "Unable to register user." });
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    const ISBN = req.params.isbn;
    res.send(books[ISBN]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const authorName = req.params.author;

    const booksByAuthor = Object.values(books).filter(book => book.author === authorName);
  
    if (booksByAuthor.length === 0) {
      return res.status(404).json({ message: "No books found for the author." });
    }
  
    return res.status(200).json(booksByAuthor);
  });

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    const booksByTitle = Object.values(books).filter(book => book.title === title);
  
    if (booksByTitle.length === 0) {
      return res.status(404).json({ message: "No books found by this Title." });
    }
  
    return res.status(200).json(booksByTitle);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    const book = books[isbn]; 
    if (!book) {
        return res.status(404).json({ message: "No books found by this ISBN." });
    }

    const reviews = book.reviews;

    if (Object.keys(reviews).length === 0) {
        return res.status(404).json({ message: "No reviews found for this book." });
    }

    return res.status(200).json(reviews);
});

module.exports.general = public_users;