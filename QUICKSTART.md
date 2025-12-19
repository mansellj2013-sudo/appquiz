## MongoDB to Embedded JSON Quiz App - Quick Start

Your quiz application is now ready to import your 955 MongoDB questions!

### What You Need to Do

1. **Export your MongoDB collection** to `quiz_data.json`:

   ```bash
   mongoexport --collection=questions --db=yourdb --out=quiz_data.json
   ```

2. **Place `quiz_data.json` in the project root** (same folder as `package.json`)

3. **Run the migration script**:

   ```bash
   node migrate-new.js
   ```

   This creates `database/questions.json` with all your questions.

4. **Start the application**:

   ```bash
   npm start
   # Or for development with auto-reload:
   npm run dev
   ```

5. **Visit** `http://localhost:3000`

### Expected MongoDB Document Schema

Your MongoDB documents should look like this:

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

### Key Points

✅ **No external database needed** - everything is embedded  
✅ **Works offline** - all questions are in `database/questions.json`  
✅ **Deploy easily** - just copy the entire folder  
✅ **Update anytime** - re-run migration with new `quiz_data.json`  
✅ **Fast performance** - JSON loads instantly

### File Structure

```
appQuiz/
├── database/
│   └── questions.json         ← Created after migration
├── controllers/
├── models/
├── views/
├── routes/
├── public/
├── migrate-new.js            ← Run this to migrate data
├── package.json
├── server.js
└── ...
```

For detailed instructions, see `MIGRATION_GUIDE.md`
