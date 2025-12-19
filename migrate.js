const fs = require("fs");
const path = require("path");
const {
  initializeDatabase,
  insertQuestion,
  hasData,
  clearAllData,
} = require("./database/db");

/**
 * Migration script to import MongoDB JSON data into SQLite
 *
 * Usage:
 *   1. Export your MongoDB collection to a JSON file
 *   2. Place the JSON file in the root directory as 'quiz_data.json'
 *   3. Run: node migrate.js
 */

async function migrateData() {
  console.log("Starting migration from MongoDB JSON to SQLite...\n");

  try {
    // Initialize database schema
    console.log("✓ Initializing database schema...");
    initializeDatabase();

    // Check if database already has data
    if (hasData()) {
      console.log(
        "⚠️  Database already contains data. Clearing existing data...\n"
      );
      clearAllData();
    }

    // Read MongoDB export JSON file
    const jsonPath = path.join(__dirname, "quiz_data.json");

    if (!fs.existsSync(jsonPath)) {
      console.error("❌ Error: quiz_data.json not found in root directory!");
      console.error(
        "   Please export your MongoDB collection and save it as quiz_data.json"
      );
      process.exit(1);
    }

    console.log("✓ Reading quiz_data.json...");
    const fileContent = fs.readFileSync(jsonPath, "utf-8");
    const questions = JSON.parse(fileContent);

    if (!Array.isArray(questions)) {
      console.error("❌ Error: JSON file must contain an array of questions!");
      process.exit(1);
    }

    console.log(`✓ Found ${questions.length} questions to import\n`);

    // Insert questions into database
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < questions.length; i++) {
      try {
        const question = questions[i];

        // Validate question structure
        if (
          !question.question ||
          !question.choices ||
          !("answer_key" in question)
        ) {
          console.warn(
            `⚠️  Skipping question ${i + 1}: Missing required fields`
          );
          errorCount++;
          continue;
        }

        // Insert question
        insertQuestion(question);
        successCount++;

        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`  Imported ${i + 1}/${questions.length} questions...`);
        }
      } catch (error) {
        console.warn(`⚠️  Error importing question ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   ✓ Imported: ${successCount} questions`);
    console.log(`   ⚠️  Skipped: ${errorCount} questions`);
    console.log(
      `\n📊 Database file location: ${path.join(
        __dirname,
        "database",
        "quiz.db"
      )}`
    );
    console.log(`\n🚀 You can now start the application with: npm start`);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateData();
