# Quiz Application - Express + EJS with MVC Pattern

A modern quiz application built with Node.js, Express, and EJS following the Model-View-Controller (MVC) architectural pattern. Supports embedding up to 955 questions from MongoDB.

## Quick Start with MongoDB

To import your MongoDB questions, see `QUICKSTART.md` and `MIGRATION_GUIDE.md`.

TL;DR:

```bash
# 1. Export MongoDB collection to quiz_data.json
# 2. Run migration
node migrate-new.js
# 3. Start app
npm start
```

```
appQuiz/
├── models/                 # Data models
│   └── Quiz.js            # Quiz model with questions and logic
├── views/                 # EJS templates
│   ├── quiz.ejs          # Main quiz page
│   ├── results.ejs       # Results page
│   └── 404.ejs           # 404 error page
├── controllers/           # Request handlers
│   └── quizController.js # Quiz logic and view rendering
├── routes/                # Route definitions
│   └── quizRoutes.js     # Quiz endpoints
├── public/                # Static files
│   └── css/
│       └── style.css     # Stylesheet
├── server.js             # Express server setup
├── package.json          # Dependencies
└── README.md             # This file
```

## Installation

1. Install dependencies:

```bash
npm install
```

## Running the Application

### Development Mode (with auto-reload):

```bash
npm run dev
```

### Production Mode:

```bash
npm start
```

The application will run on `http://localhost:3000`

## Features

- **MVC Architecture**: Clean separation of concerns

  - **Model**: Quiz data and business logic
  - **View**: EJS templates for rendering HTML
  - **Controller**: Handles requests and manages data flow

- **Quiz Functionality**:

  - Display multiple choice questions
  - Submit and validate answers
  - Display results with score and percentage
  - Review answers with correct/incorrect indicators
  - Retake quiz option

- **Responsive Design**: Works on desktop, tablet, and mobile devices

- **Modern UI**: Professional styling with animations

## API Endpoints

- `GET /` - Display quiz page
- `POST /submit` - Submit quiz answers
- `GET /reset` - Reset quiz

## Technologies Used

- **Express.js**: Web framework
- **EJS**: Template engine
- **Node.js**: Runtime environment

## Dependencies

- `express`: ^4.18.2
- `ejs`: ^3.1.8

## Dev Dependencies

- `nodemon`: ^3.0.1 (for development auto-reload)

## License

ISC
