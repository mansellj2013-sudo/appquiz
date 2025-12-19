# MongoDB Quiz App - Complete File Guide

## 📖 START HERE

**Read these files in order:**

1. **START_HERE.md** ← You are here - Overview & quick start
2. **QUICKSTART.md** - Fast 3-step setup (5 minutes)
3. **MIGRATION_GUIDE.md** - Detailed instructions

---

## 🚀 To Get Your 955 Questions Running

### Step 1: Prepare Your Data

```bash
# Export your MongoDB collection
mongoexport --collection=questions --db=yourdb --out=quiz_data.json

# Place quiz_data.json in the project root folder
# (same level as package.json)
```

### Step 2: Run Migration

```bash
node migrate-new.js
```

### Step 3: Start App

```bash
npm start
# Visit http://localhost:3000
```

---

## 📁 Important Files

### Core Application

| File                            | Purpose                     |
| ------------------------------- | --------------------------- |
| `server.js`                     | Express server (port 3000)  |
| `package.json`                  | Dependencies (Express, EJS) |
| `models/Quiz.js`                | Loads questions from JSON   |
| `controllers/quizController.js` | Handles quiz logic          |
| `routes/quizRoutes.js`          | URL routes                  |
| `views/quiz.ejs`                | Quiz page template          |
| `views/results.ejs`             | Results page template       |
| `public/css/style.css`          | Styling                     |

### Database & Migration

| File                      | Purpose                              |
| ------------------------- | ------------------------------------ |
| `migrate-new.js`          | **Run this** to import questions     |
| `database/questions.json` | **Auto-created** with your questions |
| `quiz_data.json`          | **You create this** (MongoDB export) |
| `quiz_data.example.json`  | Example format reference             |

### Documentation

| File                 | Purpose                 |
| -------------------- | ----------------------- |
| `START_HERE.md`      | Overview (you are here) |
| `QUICKSTART.md`      | Fast setup guide        |
| `MIGRATION_GUIDE.md` | Detailed guide          |
| `SETUP_COMPLETE.md`  | Complete reference      |
| `README.md`          | Full project docs       |

---

## 🔄 Workflow

```
1. Have MongoDB collection with 955 questions
   ↓
2. Export to quiz_data.json
   mongoexport --collection=questions --db=yourdb --out=quiz_data.json
   ↓
3. Place quiz_data.json in project root
   ↓
4. Run migration script
   node migrate-new.js
   ↓
5. Script creates database/questions.json
   ↓
6. Start application
   npm start
   ↓
7. Quiz loads with all 955 questions!
   http://localhost:3000
```

---

## ✅ What Was Set Up For You

- ✅ Express.js with EJS templating
- ✅ MVC architecture (clean, maintainable)
- ✅ JSON-based embedded database
- ✅ Migration script to import MongoDB data
- ✅ Beautiful responsive UI
- ✅ Support for 955 questions
- ✅ Zero external database dependencies
- ✅ Complete documentation

---

## 🎯 Your MongoDB Document Format

Your questions must be in this format:

```json
{
  "_id": { "$oid": "6938592ae0d9e523ea2f04a6" },
  "question": "What is the primary function of the Auxiliary Steam System?",
  "choices": [
    "To provide steam for the main turbine.",
    "To provide saturated steam to service various auxiliary loads.",
    "To provide steam for the boiler feed water pumps.",
    "To provide steam for the superheater."
  ],
  "answer_key": 1,
  "knowledge_area": "auxiliary_systems",
  "system_id": "auxiliary_steam",
  "created_at": { "$date": "2025-12-09T12:15:22.257Z" }
}
```

**Required fields:**

- `question` - Text of the question
- `choices` - Array with exactly 4 answer choices
- `answer_key` - Index of correct answer (0, 1, 2, or 3)

**Optional fields:**

- `knowledge_area` - Category/topic
- `system_id` - System identifier
- `_id`, `created_at` - MongoDB fields (ignored but preserved)

---

## 🧪 Test It Now

Sample questions are ready to test:

1. Start the app: `npm start`
2. Visit http://localhost:3000
3. Click through 3 sample questions
4. Click Submit
5. See your score

Then replace with your 955 questions using the migration script.

---

## 📊 After Migration

Your `database/questions.json` will contain:

```json
[
  {
    "id": 1,
    "question": "...",
    "choices": ["...", "...", "...", "..."],
    "correctAnswerIndex": 1,
    "knowledge_area": "...",
    "system_id": "...",
    "mongodb_id": "..."
  },
  ...955 more questions...
]
```

This file is automatically loaded when the app starts.

---

## 🚀 Deployment

Your entire application is self-contained:

1. No external database needed
2. No server configuration required
3. Just copy the folder anywhere
4. Run `npm install` on the new machine
5. Run `npm start`
6. Done!

---

## 🆘 Quick Troubleshooting

| Problem                  | Solution                               |
| ------------------------ | -------------------------------------- |
| `ENOENT: quiz_data.json` | Export MongoDB: `mongoexport...`       |
| `Cannot find module`     | Run `npm install`                      |
| Questions don't load     | Check `database/questions.json` exists |
| Port 3000 in use         | Change port in `server.js`             |

---

## 💡 Tips

- Keep a backup of your `quiz_data.json` after migration
- You can re-run migration anytime to update questions
- JSON format is human-readable and editable
- Test with sample questions first
- Use `npm run dev` for development (auto-reload)

---

## 📞 File Locations Quick Reference

```
Project Root
├── server.js                    ← Start here with "npm start"
├── migrate-new.js              ← Run to import questions
├── package.json                ← Dependencies
├── quiz_data.json              ← Your MongoDB export (create this)
├── database/
│   └── questions.json          ← Auto-created by migration
├── models/Quiz.js              ← Question loading
├── controllers/                ← Request handling
├── views/                       ← HTML templates
├── public/css/                  ← Styling
└── Documentation files...       ← Read these!
```

---

## ✨ Summary

**You have a complete, production-ready quiz application!**

1. Read: `QUICKSTART.md`
2. Run: `node migrate-new.js`
3. Visit: `http://localhost:3000`
4. Enjoy! 🎉

---

Last updated: December 16, 2025
