// Quiz Controller - Handles quiz logic and views
const Quiz = require("../models/Quiz");

const quiz = new Quiz();

exports.renderHome = (req, res) => {
  const knowledgeAreas = quiz.getAllKnowledgeAreas();
  const stats = quiz.getKnowledgeAreaStats();

  // Build system stats for each knowledge area
  const systemsByArea = {};
  const systemStatsByArea = {};
  knowledgeAreas.forEach((area) => {
    systemsByArea[area] = quiz.getSystemsByKnowledgeArea(area);
    systemStatsByArea[area] = quiz.getSystemStats(area);
  });

  res.render("home", {
    knowledgeAreas: knowledgeAreas,
    stats: stats,
    systemsByArea: systemsByArea,
    systemStatsByArea: systemStatsByArea,
  });
};

exports.renderQuiz = (req, res) => {
  const knowledgeArea = req.query.area || null;
  const systemId = req.query.system || null;
  const questions = quiz.getQuestionsByKnowledgeAreaAndSystem(
    knowledgeArea,
    systemId
  );

  res.render("quiz", {
    questions: questions,
    totalQuestions: questions.length,
    knowledgeArea: knowledgeArea,
    systemId: systemId,
  });
};

exports.submitQuiz = (req, res) => {
  try {
    const answers = req.body;
    const knowledgeArea = req.body.knowledgeArea || null;
    const systemId = req.body.systemId || null;

    console.log("Received answers:", answers);
    console.log("Knowledge area:", knowledgeArea);
    console.log("System ID:", systemId);

    const questions = quiz.getQuestionsByKnowledgeAreaAndSystem(
      knowledgeArea,
      systemId
    );

    let score = 0;
    const results = [];

    questions.forEach((question) => {
      const userAnswerIndex = parseInt(answers[`question_${question.id}`], 10);
      console.log(
        `Question ${question.id}: userAnswer = ${userAnswerIndex}, correctAnswer = ${question.correctAnswerIndex}`
      );

      const isCorrect = quiz.checkAnswer(question.id, userAnswerIndex);

      if (isCorrect) {
        score++;
      }

      const choiceLetters = ["a", "b", "c", "d"];
      const userChoiceLetter = choiceLetters[userAnswerIndex] || "?";
      const correctChoiceLetter =
        choiceLetters[question.correctAnswerIndex] || "?";

      results.push({
        questionId: question.id,
        question: question.question,
        userAnswer: userChoiceLetter,
        userAnswerText:
          question.choices[userAnswerIndex] || "No answer provided",
        correctAnswer: correctChoiceLetter,
        correctAnswerText: question.choices[question.correctAnswerIndex],
        isCorrect: isCorrect,
      });
    });

    res.render("results", {
      score: score,
      totalQuestions: questions.length,
      results: results,
      percentage: Math.round((score / questions.length) * 100),
      knowledgeArea: knowledgeArea,
      systemId: systemId,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    throw error;
  }
};
