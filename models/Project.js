const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: { type: String, required: true, unique: true },
    totalWork: { type: Number, required: true },
    workDone: { type: Number, required: true }
});

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
