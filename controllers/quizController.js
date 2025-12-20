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
    console.log("[submitQuiz] Path:", req.path, "Method:", req.method);
    console.log("[submitQuiz] Body keys:", Object.keys(req.body));
    const quiz = req.app.locals.quiz;

    if (!quiz) {
      console.log("[submitQuiz] Quiz not loaded - quiz is", typeof quiz);
      return res.status(503).json({ error: "Quiz data not loaded yet" });
    }

    const answers = req.body;
    const knowledgeArea = req.body.knowledgeArea || null;
    const systemId = req.body.systemId || null;

    console.log("[submitQuiz] Received answers:", Object.keys(answers));
    console.log("[submitQuiz] Knowledge area:", knowledgeArea);
    console.log("[submitQuiz] System ID:", systemId);

    const questions = quiz.getQuestionsByKnowledgeAreaAndSystem(
      knowledgeArea,
      systemId
    );

    console.log("[submitQuiz] Retrieved questions:", questions.length);

    let score = 0;
    const results = [];

    questions.forEach((question) => {
      const userAnswerIndex = parseInt(answers[`question_${question.id}`], 10);

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

    console.log("[submitQuiz] Processed results, score:", score);

    res.render("results", {
      score: score,
      totalQuestions: questions.length,
      results: results,
      percentage: Math.round((score / questions.length) * 100),
      knowledgeArea: knowledgeArea,
      systemId: systemId,
    });

    console.log("[submitQuiz] Results rendered successfully");
  } catch (error) {
    console.error("[submitQuiz] Error:", error);
    res
      .status(500)
      .json({
        error: "Error processing quiz submission",
        details: error.message,
      });
  }
};
