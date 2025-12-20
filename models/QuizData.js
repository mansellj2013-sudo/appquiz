// QuizData Model - MongoDB schema for quiz questions
const mongoose = require("mongoose");

const quizDataSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    choices: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 4; // Ensure 4 choices
        },
        message: "Must have exactly 4 choices",
      },
    },
    answer_key: {
      type: Number,
      required: true,
      enum: [0, 1, 2, 3], // Valid choice indices
    },
    knowledge_area: {
      type: String,
      required: true,
    },
    system_id: {
      type: String,
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
  },
  { collection: "quiz_data" }
);

module.exports = mongoose.model("QuizData", quizDataSchema);
