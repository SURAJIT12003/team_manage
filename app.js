const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/User'); // Import the User model
const passport = require('passport');
const app = express();
const session = require('express-session');

// Replace with your MongoDB Atlas connection string
const mongoDBAtlasURI = 'mongodb+srv://surajitde29:pWc20RS82efZt25k@cluster0.sfynh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoDBAtlasURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(error => console.error('Error connecting to MongoDB Atlas:', error));

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'your_secret_key', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Function to add default manager if not exists
const addDefaultManager = async () => {
  const defaultManagerEmail = 'surajitde555@gmail.com';
  const existingManager = await User.findOne({ email: defaultManagerEmail, role: 'Manager' });

  if (!existingManager) {
    const manager = new User({
      email: defaultManagerEmail,
      role: 'Manager',
      name: 'Default Manager',
      password: '123' // Assuming password is stored as plain text for simplicity; in production, hash passwords
    });
    await manager.save();
    console.log('Default manager added to the database');
  } else {
    console.log('Default manager already exists in the database');
  }
};

// Call the function to add the default manager
addDefaultManager();

const indexRoutes = require('./routes/index');
app.use('/', indexRoutes);

app.listen(3500, () => {
  console.log('Server started on port 3500');
});