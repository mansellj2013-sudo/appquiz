const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "quiz.db");
let db = null;
let SQL = null;

/**
 * Initialize SQL.js
 */
async function initSQL() {
  if (!SQL) {
    SQL = await initSqlJs();
  }
  return SQL;
}

/**
 * Initialize database
 */
async function initializeDatabase() {
  const SQLModule = await initSQL();

  // Try to load existing database
  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQLModule.Database(buffer);
  } else {
    db = new SQLModule.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mongodb_id TEXT UNIQUE,
      question TEXT NOT NULL,
      knowledge_area TEXT,
      system_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      question_id INTEGER NOT NULL,
      choice_index INTEGER NOT NULL,
      choice_text TEXT NOT NULL,
      FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
      UNIQUE(question_id, choice_index)
    );
  `);

  db.run(`
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
 * Save database to file
 */
function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
}

/**
 * Get all questions with their choices and answers
 */
function getAllQuestions() {
  if (!db) return [];

  try {
    const stmt = db.prepare(`
      SELECT 
        q.id,
        q.question,
        q.knowledge_area,
        q.system_id,
        ak.answer_key
      FROM questions q
      LEFT JOIN answer_keys ak ON q.id = ak.question_id
      ORDER BY q.id
    `);

    const questions = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      const choicesStmt = db.prepare(`
        SELECT choice_index, choice_text 
        FROM choices 
        WHERE question_id = ? 
        ORDER BY choice_index
      `);
      choicesStmt.bind([row.id]);

      const choices = [];
      while (choicesStmt.step()) {
        const choiceRow = choicesStmt.getAsObject();
        choices.push(choiceRow.choice_text);
      }
      choicesStmt.free();

      questions.push({
        id: row.id,
        question: row.question,
        knowledge_area: row.knowledge_area,
        system_id: row.system_id,
        choices: choices,
        correctAnswerIndex: row.answer_key,
      });
    }
    stmt.free();

    return questions;
  } catch (error) {
    console.error("Error getting questions:", error);
    return [];
  }
}

/**
 * Get a single question by ID
 */
function getQuestionById(id) {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      SELECT 
        q.id,
        q.question,
        q.knowledge_area,
        q.system_id,
        ak.answer_key
      FROM questions q
      LEFT JOIN answer_keys ak ON q.id = ak.question_id
      WHERE q.id = ?
    `);
    stmt.bind([id]);

    if (!stmt.step()) {
      stmt.free();
      return null;
    }

    const row = stmt.getAsObject();
    stmt.free();

    const choicesStmt = db.prepare(`
      SELECT choice_index, choice_text 
      FROM choices 
      WHERE question_id = ? 
      ORDER BY choice_index
    `);
    choicesStmt.bind([id]);

    const choices = [];
    while (choicesStmt.step()) {
      const choiceRow = choicesStmt.getAsObject();
      choices.push(choiceRow.choice_text);
    }
    choicesStmt.free();

    return {
      id: row.id,
      question: row.question,
      knowledge_area: row.knowledge_area,
      system_id: row.system_id,
      choices: choices,
      correctAnswerIndex: row.answer_key,
    };
  } catch (error) {
    console.error("Error getting question:", error);
    return null;
  }
}

/**
 * Get total question count
 */
function getTotalQuestionCount() {
  if (!db) return 0;

  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM questions");
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row.count;
  } catch (error) {
    console.error("Error getting total count:", error);
    return 0;
  }
}

/**
 * Insert a question with choices and answer
 */
function insertQuestion(mongoQuestion) {
  if (!db) return null;

  try {
    const stmt = db.prepare(`
      INSERT INTO questions (mongodb_id, question, knowledge_area, system_id)
      VALUES (?, ?, ?, ?)
    `);
    stmt.bind([
      mongoQuestion._id.$oid,
      mongoQuestion.question,
      mongoQuestion.knowledge_area,
      mongoQuestion.system_id,
    ]);
    stmt.step();
    stmt.free();

    // Get the last inserted ID
    const idStmt = db.prepare("SELECT last_insert_rowid() as id");
    idStmt.step();
    const idRow = idStmt.getAsObject();
    idStmt.free();
    const questionId = idRow.id;

    // Insert choices
    mongoQuestion.choices.forEach((choice, index) => {
      const choiceStmt = db.prepare(`
        INSERT INTO choices (question_id, choice_index, choice_text)
        VALUES (?, ?, ?)
      `);
      choiceStmt.bind([questionId, index, choice]);
      choiceStmt.step();
      choiceStmt.free();
    });

    // Insert answer key
    const answerStmt = db.prepare(`
      INSERT INTO answer_keys (question_id, answer_key)
      VALUES (?, ?)
    `);
    answerStmt.bind([questionId, mongoQuestion.answer_key]);
    answerStmt.step();
    answerStmt.free();

    return questionId;
  } catch (error) {
    console.error("Error inserting question:", error);
    return null;
  }
}

/**
 * Check if database has data
 */
function hasData() {
  if (!db) return false;

  try {
    const stmt = db.prepare("SELECT COUNT(*) as count FROM questions");
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row.count > 0;
  } catch (error) {
    return false;
  }
}

/**
 * Clear all data
 */
function clearAllData() {
  if (!db) return;

  try {
    db.run("DELETE FROM answer_keys");
    db.run("DELETE FROM choices");
    db.run("DELETE FROM questions");
    console.log("All data cleared from database");
  } catch (error) {
    console.error("Error clearing data:", error);
  }
}

module.exports = {
  db: () => db,
  initSQL,
  initializeDatabase,
  getAllQuestions,
  getQuestionById,
  getTotalQuestionCount,
  insertQuestion,
  hasData,
  clearAllData,
  saveDatabase,
};
