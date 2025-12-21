// Quiz Controller - Handles quiz logic and views

exports.renderHome = (req, res) => {
  // Get quiz instance from app.locals (set in server.js after MongoDB connects)
  const quiz = req.app.locals.quiz;

  if (!quiz) {
    return res.status(503).json({ error: "Quiz data not loaded yet" });
  }

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
  const quiz = req.app.locals.quiz;

  if (!quiz) {
    return res.status(503).json({ error: "Quiz data not loaded yet" });
  }

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
    console.log("[submitQuiz] Starting quiz submission");
    const quiz = req.app.locals.quiz;

    if (!quiz) {
      return res.status(503).json({ error: "Quiz data not loaded yet" });
    }

    const answers = req.body;
    const knowledgeArea = req.body.knowledgeArea || null;
    const systemId = req.body.systemId || null;

    const questions = quiz.getQuestionsByKnowledgeAreaAndSystem(
      knowledgeArea,
      systemId
    );

    // Create a lookup map for O(1) access instead of O(n) search
    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q.id] = q;
    });

    let score = 0;
    const results = [];
    const choiceLetters = ["a", "b", "c", "d"];

    // Process all answers in one efficient pass
    for (const [key, value] of Object.entries(answers)) {
      // Skip non-question fields
      if (!key.startsWith("question_")) continue;

      const questionId = key.replace("question_", "");
      const question = questionMap[questionId];

      // Skip if question not found
      if (!question) continue;

      const userAnswerIndex = parseInt(value, 10);
      const isCorrect = question.correctAnswerIndex === userAnswerIndex;

      if (isCorrect) {
        score++;
      }

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
    }

    res.render("results", {
      score: score,
      totalQuestions: questions.length,
      results: results,
      percentage: Math.round((score / questions.length) * 100),
      knowledgeArea: knowledgeArea,
      systemId: systemId,
    });
  } catch (error) {
    console.error("[submitQuiz] Error:", error);
    res.status(500).json({
      error: "Error processing quiz submission",
      details: error.message,
    });
  }
};
