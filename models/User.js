// Example User schema (models/User.js)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    role: { type: String, required: true, enum: ['Manager', 'Team Leader', 'Team Member'] },
    teamName: { type: String },  // Optional: For tracking the team name of the user
    position: String
});

const User = mongoose.model('User', userSchema);

module.exports = User;
