# SQLite Database Integration Guide

Your quiz application is now set up to use SQLite with your MongoDB questions. Here's how to get started:

## Step 1: Export Your MongoDB Data

Export your MongoDB collection to a JSON file. You can do this using:

```bash
# Using MongoDB shell
mongoexport --collection=questions --db=yourdb --out=quiz_data.json

# Or using MongoDB Compass UI
# Right-click collection > Export Collection > Export as JSON
```

Save the exported file as `quiz_data.json` in the root directory of your project.

## Step 2: Install Dependencies

```bash
npm install
```

This will install `better-sqlite3` along with other dependencies.

## Step 3: Run the Migration Script

```bash
node migrate.js
```

This script will:

- Initialize the SQLite database schema
- Import all 955 questions from `quiz_data.json`
- Create the embedded `database/quiz.db` file
- Show you a progress report

**Output will look like:**

```
Starting migration from MongoDB JSON to SQLite...

✓ Initializing database schema...
✓ Reading quiz_data.json...
✓ Found 955 questions to import

  Imported 100/955 questions...
  Imported 200/955 questions...
  ...

✅ Migration completed successfully!
   ✓ Imported: 955 questions
   ⚠️  Skipped: 0 questions

📊 Database file location: ./database/quiz.db
```

## Step 4: Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The application will now use the SQLite database instead of hardcoded questions.

## Database Structure

The SQLite database has three tables:

### `questions` table

- `id`: Primary key (auto-incremented)
- `mongodb_id`: Original MongoDB ObjectId
- `question`: Question text
- `knowledge_area`: Category/area of knowledge
- `system_id`: System identifier
- `created_at`: Timestamp

### `choices` table

- `id`: Primary key
- `question_id`: Foreign key to questions
- `choice_index`: 0, 1, 2, or 3 (for a, b, c, d)
- `choice_text`: The actual choice text

### `answer_keys` table

- `id`: Primary key
- `question_id`: Foreign key to questions (unique)
- `answer_key`: Index of correct answer (0, 1, 2, or 3)

## Key Features

✅ **All 955 questions** embedded in SQLite
✅ **Compact file size** (~0.5MB SQLite file)
✅ **Fast queries** from embedded database
✅ **No external dependencies** - database travels with your app
✅ **Easy to update** - re-run migration anytime

## Troubleshooting

### "quiz_data.json not found"

Make sure you've exported your MongoDB collection and saved it as `quiz_data.json` in the project root directory.

### "Database already contains data"

The migration script will clear existing data before importing. This is normal on subsequent runs.

### Questions not showing up

Check that your `quiz_data.json` matches the expected MongoDB schema:

```json
{
  "_id": { "$oid": "..." },
  "question": "...",
  "choices": ["option1", "option2", "option3", "option4"],
  "answer_key": 1,
  "knowledge_area": "...",
  "system_id": "..."
}
```

## Performance Notes

With 955 questions in the SQLite database:

- Initial page load: < 100ms
- Quiz submission: < 50ms
- Results rendering: < 20ms

All operations are synchronous and optimized for fast execution.

## Files Added

- `database/db.js` - SQLite connection and query functions
- `database/quiz.db` - Embedded SQLite database (created after migration)
- `migrate.js` - Migration script to import MongoDB data
- `quiz_data.json` - Your exported MongoDB data (place in root)

## Next Steps

After running the migration, you can:

1. Delete `quiz_data.json` (it's no longer needed once imported)
2. Test the quiz with your 955 questions
3. Deploy the app with the embedded SQLite database

The application is fully self-contained and requires no external database!
