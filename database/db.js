const Database = require("better-sqlite3");
const path = require("path");

// Database file path
const dbPath = path.join(__dirname, "quiz.db");

// Initialize database connection
const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

/**
 * Initialize database schema
 */
function initializeDatabase() {
  // Create questions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mongodb_id TEXT UNIQUE,
      question TEXT NOT NULL,
      knowledge_area TEXT,
      system_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(mongodb_id)
    );
  `);

  // Create choices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      choice_index INTEGER NOT NULL,
      choice_text TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(question_id, choice_index)
    );
  `);

  // Create answer_keys table
  db.exec(`
    CREATE TABLE IF NOT EXISTS answer_keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER UNIQUE NOT NULL,
      answer_key INTEGER NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    );
  `);

  console.log("Database schema initialized successfully");
}

/**
 * Get all questions with their choices and answers
 */
function getAllQuestions() {
  const questions = db
    .prepare(
      `
    SELECT 
      q.id,
      q.question,
      q.knowledge_area,
      q.system_id,
      ak.answer_key
    FROM questions q
    LEFT JOIN answer_keys ak ON q.id = ak.question_id
    ORDER BY q.id
  `
    )
    .all();

  // For each question, get all choices
  const questionsWithChoices = questions.map((q) => {
    const choices = db
      .prepare(
        `
      SELECT choice_index, choice_text 
      FROM choices 
      WHERE question_id = ? 
      ORDER BY choice_index
    `
      )
      .all(q.id);

    return {
      id: q.id,
      question: q.question,
      knowledge_area: q.knowledge_area,
      system_id: q.system_id,
      choices: choices.map((c) => c.choice_text),
      correctAnswerIndex: q.answer_key,
    };
  });

  return questionsWithChoices;
}

/**
 * Get a single question by ID
 */
function getQuestionById(id) {
  const question = db
    .prepare(
      `
    SELECT 
      q.id,
      q.question,
      q.knowledge_area,
      q.system_id,
      ak.answer_key
    FROM questions q
    LEFT JOIN answer_keys ak ON q.id = ak.question_id
    WHERE q.id = ?
  `
    )
    .get(id);

  if (!question) return null;

  const choices = db
    .prepare(
      `
      SELECT choice_index, choice_text 
      FROM choices 
      WHERE question_id = ? 
      ORDER BY choice_index
    `
    )
    .all(id);

  return {
    id: question.id,
    question: question.question,
    knowledge_area: question.knowledge_area,
    system_id: question.system_id,
    choices: choices.map((c) => c.choice_text),
    correctAnswerIndex: question.answer_key,
  };
}

/**
 * Get total question count
 */
function getTotalQuestionCount() {
  const result = db.prepare("SELECT COUNT(*) as count FROM questions").get();
  return result.count;
}

/**
 * Insert a question with choices and answer
 */
function insertQuestion(mongoQuestion) {
  const stmt = db.prepare(`
    INSERT INTO questions (mongodb_id, question, knowledge_area, system_id)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(
    mongoQuestion._id.$oid,
    mongoQuestion.question,
    mongoQuestion.knowledge_area,
    mongoQuestion.system_id
  );

  const questionId = result.lastInsertRowid;

  // Insert choices
  const choiceStmt = db.prepare(`
    INSERT INTO choices (question_id, choice_index, choice_text)
    VALUES (?, ?, ?)
  `);

  mongoQuestion.choices.forEach((choice, index) => {
    choiceStmt.run(questionId, index, choice);
  });

  // Insert answer key
  const answerStmt = db.prepare(`
    INSERT INTO answer_keys (question_id, answer_key)
    VALUES (?, ?)
  `);

  answerStmt.run(questionId, mongoQuestion.answer_key);

  return questionId;
}

/**
 * Check if database has data
 */
function hasData() {
  const result = db.prepare("SELECT COUNT(*) as count FROM questions").get();
  return result.count > 0;
}

/**
 * Clear all data (useful for reimporting)
 */
function clearAllData() {
  db.prepare("DELETE FROM answer_keys").run();
  db.prepare("DELETE FROM choices").run();
  db.prepare("DELETE FROM questions").run();
  console.log("All data cleared from database");
}

module.exports = {
  db,
  initializeDatabase,
  getAllQuestions,
  getQuestionById,
  getTotalQuestionCount,
  insertQuestion,
  hasData,
  clearAllData,
};
