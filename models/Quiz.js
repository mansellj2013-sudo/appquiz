// Quiz Model - Contains quiz data and logic
const QuizData = require("./QuizData");

class Quiz {
  constructor() {
    // Initialize with empty questions array
    // Questions will be loaded from MongoDB via loadQuestions()
    this.questions = [];
  }

  async loadQuestions() {
    try {
      const documents = await QuizData.find({}).sort({ created_at: 1 });

      // Map MongoDB documents to quiz question format
      this.questions = documents.map((doc) => {
        return {
          id: doc._id.toString(), // Use MongoDB ObjectId as string
          question: doc.question,
          knowledge_area: doc.knowledge_area,
          system_id: doc.system_id,
          choices: doc.choices,
          correctAnswerIndex: doc.answer_key,
        };
      });

      console.log(`Loaded ${this.questions.length} questions from MongoDB`);
      return this.questions;
    } catch (error) {
      console.error("Error loading questions from MongoDB:", error);
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
