// Quiz Model - Contains quiz data and logic
const Database = require("better-sqlite3");
const path = require("path");

class Quiz {
  constructor() {
    // Initialize database connection
    this.dbPath = path.join(__dirname, "../database/quiz.db");
    this.db = new Database(this.dbPath);
    this.db.pragma("foreign_keys = ON");

    // Load questions from SQLite database
    this.questions = this.loadQuestions();
  }

  loadQuestions() {
    try {
      const questions = this.db
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
        const choices = this.db
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
    } catch (error) {
      console.error("Error loading questions from database:", error);
      return [];
    }
  }

  getAllQuestions() {
    return this.questions;
  }

  getQuestionById(id) {
    return this.questions.find((q) => q.id === id);
  }

  getTotalQuestionCount() {
    return this.questions.length;
  }

  checkAnswer(questionId, userAnswerIndex) {
    const question = this.getQuestionById(questionId);
    if (!question) return false;
    // userAnswerIndex should be a number (0, 1, 2, 3)
    return question.correctAnswerIndex === parseInt(userAnswerIndex, 10);
  }

  getQuestionsByKnowledgeArea(knowledgeArea) {
    if (!knowledgeArea) {
      return this.questions;
    }
    return this.questions.filter((q) => q.knowledge_area === knowledgeArea);
  }

  getAllKnowledgeAreas() {
    const areas = new Set();
    this.questions.forEach((q) => {
      if (q.knowledge_area) {
        areas.add(q.knowledge_area);
      }
    });
    return Array.from(areas).sort();
  }

  getKnowledgeAreaStats() {
    const stats = {};
    this.questions.forEach((q) => {
      const area = q.knowledge_area || "uncategorized";
      stats[area] = (stats[area] || 0) + 1;
    });
    return stats;
  }

  getSystemsByKnowledgeArea(knowledgeArea) {
    const systems = new Set();
    this.questions.forEach((q) => {
      if (q.knowledge_area === knowledgeArea && q.system_id) {
        systems.add(q.system_id);
      }
    });
    return Array.from(systems).sort();
  }

  getQuestionsByKnowledgeAreaAndSystem(knowledgeArea, systemId) {
    let filtered = this.questions;
    if (knowledgeArea) {
      filtered = filtered.filter((q) => q.knowledge_area === knowledgeArea);
    }
    if (systemId) {
      filtered = filtered.filter((q) => q.system_id === systemId);
    }
    return filtered;
  }

  getSystemStats(knowledgeArea) {
    const stats = {};
    const questionsInArea = this.getQuestionsByKnowledgeArea(knowledgeArea);
    questionsInArea.forEach((q) => {
      const system = q.system_id || "uncategorized";
      stats[system] = (stats[system] || 0) + 1;
    });
    return stats;
  }
}

module.exports = Quiz;
