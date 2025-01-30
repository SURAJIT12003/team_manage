const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Project = require("../models/Project");

// Login Route
router.get("/login", (req, res) => {
  res.render("login");
});

router.post("/login", async (req, res) => {
  const { email, role } = req.body;
  const user = await User.findOne({ email, role });
  
  if(!user) {return res.redirect("/login")};
  if (user.role=='Manager') {
    req.session.user = user;
    res.redirect("/dashboard");
  } else if(user.role=='Team Leader') {
    //console.log(user);
    
    req.session.user = user;
    res.redirect("/team-leader-dashboard");

  }else if(user.role=='Team Member'){
    req.session.user = user;
    res.redirect("/team-members");

  }else {
    res.redirect("/login");
  }
});

// Manager main Dashboard Route ****
router.get("/dashboard", async (req, res) => {
  const user = req.session.user; // Assuming user data is stored in the session or retrieved via middleware
 // console.log(user);
  res.render("dashboard", { user });
});

// Team Leader dashboard ***
router.get("/team-leader-dashboard", async (req, res) => {
  const user = req.session.user; // Retrieve user details from session
  //console.log(user);
  
  if (user && user.role === 'Team Leader') {
    // Fetch team members using team name
    const teamMembers = await User.find({ teamName: user.teamName });

    // Create an object with team leader name and team members
    const teamData = {
      teamName: user.teamName,
      teamMembers: [{ name: user.name, position: 'Team Leader' }, ...teamMembers]
    };
    //console.log(teamData);
    
    res.render("dashboard-leader", { teamData });
  } else {
    res.redirect("/login");
  }
});

// Add Team Leader
router.get("/add-team-leader", (req, res) => {
  res.render("addTeamLeader");
});

router.post("/add-team-leader", async (req, res) => {
  const { email, name, teamName } = req.body;

  try {
    // Check if a team leader with the same team name already exists
    const existingTeamLeader = await User.findOne({
      teamName: teamName,
      role: "Team Leader",
    });

    if (existingTeamLeader) {
      // If a team leader with the same team name exists, send an error message
      return res
        .status(400)
        .send(
          "A team leader with this team name already exists. Please choose a different team name."
        );
    }

    // If the team name is unique, proceed to add the new team leader
    const newTeamLeader = new User({
      email,
      name,
      teamName,
      role: "Team Leader",
    });
    await newTeamLeader.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error adding team leader:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Add Team Member
router.get("/add-team-member", (req, res) => {
  res.render("addTeamMember");
});

router.post("/add-team-member", async (req, res) => {
  const { email, name, teamName, position } = req.body;

  try {
    // Check if there is a team leader with the provided team name
    const existingTeamLeader = await User.findOne({
      teamName: teamName,
      role: "Team Leader",
    });

    if (!existingTeamLeader) {
      // If no team leader exists for the team name, send an error message
      return res
        .status(400)
        .send("Team name does not exist. Please enter a valid team name.");
    }

    // If a team leader exists, proceed to save the new team member
    const newMember = new User({
      email,
      name,
      teamName,
      position,
      role: "Team Member",
    });
    await newMember.save();
    res.redirect("/dashboard");
  } catch (error) {
    console.error("Error adding team member:", error);
    res.status(500).send("Internal Server Error");
  }
});

// View All Members and Leaders
router.get("/view-all", async (req, res) => {
  const users = await User.find({});
  res.render("viewAll", { users });
});

// View Project Progress
router.get("/project-progress", async (req, res) => {
  const projects = await Project.find({});
  res.render("team-progress.ejs", { projects });
});

// GET route to render the update progress form
router.get("/update-progress", async (req, res) => {
  
  const project = await Project.findOne({ projectName: "Main Project" });

  res.render("update-progress", { project });
});

// POST route to handle progress updates
router.post("/update-progress", async (req, res) => {
  const { totalWork, workDone } = req.body;

  try {
    // Find the project and update its progress
    const project = await Project.findOne({ projectName: "Main Project" });

    if (project) {
      project.totalWork = totalWork;
      project.workDone = workDone;
      await project.save();
    } else {
      // If no project exists, create a new one
      const newProject = new Project({
        projectName: "Main Project",
        totalWork,
        workDone,
      });
      await newProject.save();
    }

    res.redirect("/team-leader-dashboard");
  } catch (error) {
    console.error("Error updating project progress:", error);
    res.status(500).send("Internal Server Error");
  }
});


//Team Memeber Dashboard
router.get("/team-members", async (req, res) => {
  const user = req.session.user; // Retrieve user details from session

  if (user && (user.role === 'Team Member')) {
    
    // Fetch team members using team name
    const teamMembers = await User.find({ teamName: user.teamName });

    // Find the team leader
    const teamLeader = await User.findOne({ teamName: user.teamName, role: 'Team Leader' });

    // Create an object with team leader name and team members
    const teamData = {
     
      teamLeaderName: teamLeader ? teamLeader.name : 'No Team Leader',
      teamMembers: teamMembers
    };
    console.log(teamData);
    
    res.render("team-members", { teamData });
  } else {
    res.redirect("/login");
  }
});







module.exports = router;
