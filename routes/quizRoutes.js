// Quiz Routes - Defines quiz endpoints
const express = require("express");
const quizController = require("../controllers/quizController");

const router = express.Router();

// GET route to display home/category selection
router.get("/", quizController.renderHome);

// GET route to display quiz (with optional area filter)
router.get("/quiz", quizController.renderQuiz);

// POST route to submit quiz answers
router.post("/submit", quizController.submitQuiz);

// GET route to reset quiz
router.get("/reset", (req, res) => {
  res.redirect("/");
});

module.exports = router;
