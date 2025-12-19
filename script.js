const quizContainer = document.getElementById("quizContainer");
const questionElement = document.getElementById("question");
const answersElement = document.getElementById("answers");
const submitButton = document.getElementById("submitButton");
const resetButton = document.getElementById("resetButton");
const resultsContainer = document.getElementById("results");

const questions = [
  {
    question:
      "Which of the following two source feed the U5 L&P system North Bus?",
    answers: {
      a: "Unit Aux Transformer or North Queens 1Q92 K&L Legs<br>",
      b: "Unit-5 North Main Transformer or North Queens 1Q91 K&M Legs<br>",
      c: "Unit Aux Transformer or South Queens 1Q91 K&L Legs<br>",
      d: "Unit-5 South Main Transformer or South Queens 1Q92 K&M Legs",
    },
    correctAnswer: "a",
  },
  {
    question:
      "208V 50LP1/LP2 Substation are backed by which of the following sources?",
    answers: {
      a: "30LP1/30LP2 back each other up via automatic cross connect switch<br>",
      b: "50LP1/LP2 are backed up by an ATS from 40LP1/LP2<br>",
      c: "50LP1/LP2 are backed up from street network sources<br>",
      d: "50LP1/LP2 are backed up by an ATS from 30LP1/LP2",
    },
    correctAnswer: "c",
  },
  {
    question:
      "New - 1 208V 50LP1/LP2 Substation are backed by which of the following sources?",
    answers: {
      a: "30LP1/30LP2 back each other up via automatic cross connect switch<br>",
      b: "50LP1/LP2 are backed up by an ATS from 40LP1/LP2<br>",
      c: "50LP1/LP2 are backed up from street network sources<br>",
      d: "50LP1/LP2 are backed up by an ATS from 30LP1/LP2",
    },
    correctAnswer: "c",
  },
  {
    question:
      "New - 2 208V 50LP1/LP2 Substation are backed by which of the following sources?",
    answers: {
      a: "30LP1/30LP2 back each other up via automatic cross connect switch<br>",
      b: "50LP1/LP2 are backed up by an ATS from 40LP1/LP2<br>",
      c: "50LP1/LP2 are backed up from street network sources<br>",
      d: "50LP1/LP2 are backed up by an ATS from 30LP1/LP2",
    },
    correctAnswer: "c",
  },
];

let currentQuestionIndex = 0;
let score = 0;

function buildQuiz() {
  const currentQuestion = questions[currentQuestionIndex];
  questionElement.textContent = currentQuestion.question;
  answersElement.innerHTML = ""; // Clear previous answers

  for (const letter in currentQuestion.answers) {
    const answerElement = document.createElement("label");
    answerElement.innerHTML = `<input type="radio" name="answer" value="${letter}"> ${letter}: ${currentQuestion.answers[letter]}`;
    answersElement.appendChild(answerElement);
  }
}

function showResults() {
  resultsContainer.innerHTML = `You scored ${score} out of ${questions.length} !`;
}

function checkAnswer() {
  const selectedAnswer = document.querySelector('input[name="answer"]:checked');
  if (selectedAnswer) {
    const userAnswer = selectedAnswer.value;
    const currentQuestion = questions[currentQuestionIndex];

    if (userAnswer === currentQuestion.correctAnswer) {
      score++;
    }
    currentQuestionIndex++;

    if (currentQuestionIndex < questions.length) {
      buildQuiz();
    } else {
      showResults();
      submitButton.disabled = true; // Disable submit button after quiz completion
      resetButton.disable = false; // enable reset button to build quiz
    }
  }
}

buildQuiz();

submitButton.addEventListener("click", checkAnswer);
resetButton.addEventListener("click", buildQuiz);
