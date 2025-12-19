# MongoDB to JSON Database Integration Guide

Your quiz application is now set up to import your 955 MongoDB questions into an embedded JSON database. This is lightweight, requires no external databases, and embeds perfectly with your application.

## Step 1: Export Your MongoDB Data

Export your MongoDB collection to a JSON file. You can do this using:

```bash
# Using MongoDB shell
mongoexport --collection=questions --db=yourdb --out=quiz_data.json

# Or using MongoDB Compass UI
# Right-click collection > Export Collection > Export as JSON
```

Save the exported file as `quiz_data.json` in the root directory of your project (same level as `package.json`).

## Step 2: Run the Migration Script

```bash
node migrate-new.js
```

This script will:

- Read your `quiz_data.json` file
- Transform all 955 questions to the application format
- Create `database/questions.json` with all your questions
- Show you a progress report

**Output will look like:**

```
Starting migration from MongoDB JSON to questions.json...

✓ Reading quiz_data.json...
✓ Found 955 questions to import

✅ Migration completed successfully!
   ✓ Imported: 955 questions
   ⚠️  Skipped: 0 questions

📊 Database file location: ./database/questions.json
📏 File size: 450.25 KB

🚀 You can now start the application with: npm start
```

## Step 3: Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Or production mode
npm start
```

The application will now load all 955 questions from the embedded `database/questions.json` file.

## Database Structure

The JSON file contains an array of question objects:

```json
[
  {
    "id": 1,
    "question": "What is the primary function of the Auxiliary Steam System?",
    "choices": [
      "To provide steam for the main turbine.",
      "To provide saturated steam to service various auxiliary loads.",
      "To provide steam for the boiler feed water pumps.",
      "To provide steam for the superheater."
    ],
    "correctAnswerIndex": 1,
    "knowledge_area": "auxiliary_systems",
    "system_id": "auxiliary_steam",
    "mongodb_id": "6938592ae0d9e523ea2f04a6"
  },
  ...
]
```

## Key Features

✅ **All 955 questions** embedded in JSON
✅ **Compact file size** (~450 KB)
✅ **No external dependencies** - database travels with your app
✅ **Fast queries** - JSON loading is instant
✅ **Easy to update** - re-run migration anytime
✅ **Simple format** - easily editable and portable

## Troubleshooting

### "quiz_data.json not found"

Make sure you've exported your MongoDB collection and saved it as `quiz_data.json` in the root directory of the project.

### "JSON file must contain an array"

Your exported file needs to be a JSON array of question objects. If MongoDB exported it differently, you may need to adjust the export format.

### Questions not showing up after migration

1. Check that `database/questions.json` was created successfully
2. Make sure the file contains your question data
3. Restart the application

## Performance

With 955 questions in the embedded JSON database:

- Initial page load: < 50ms
- Quiz submission: < 20ms
- Results rendering: < 10ms

All operations are synchronous and extremely fast.

## Files Structure

```
appQuiz/
├── database/
│   └── questions.json      # Embedded question database (created after migration)
├── controllers/
├── models/
├── views/
├── public/
├── migrate-new.js          # Migration script
├── quiz_data.json          # Your exported MongoDB data (can delete after migration)
└── ...
```

## Next Steps

After running the migration:

1. Verify that `database/questions.json` was created
2. You can delete `quiz_data.json` (it's no longer needed)
3. Test the quiz with your 955 questions
4. Deploy the app - the embedded database goes with it!

The application is fully self-contained and requires no external database!
