const fs = require("fs");
const path = require("path");

/**
 * Migration script to import MongoDB JSON data to embedded questions.json
 *
 * Usage:
 *   1. Export your MongoDB collection to a JSON file
 *   2. Place the JSON file in the root directory as 'quiz_data.json'
 *   3. Run: node migrate.js
 */

function migrateData() {
  console.log("Starting migration from MongoDB JSON to questions.json...\n");

  try {
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
    const mongoQuestions = JSON.parse(fileContent);

    if (!Array.isArray(mongoQuestions)) {
      console.error("❌ Error: JSON file must contain an array of questions!");
      process.exit(1);
    }

    console.log(`✓ Found ${mongoQuestions.length} questions to import\n`);

    // Transform MongoDB questions to our format
    let successCount = 0;
    let errorCount = 0;

    const transformedQuestions = mongoQuestions
      .map((mongoQuestion, index) => {
        try {
          // Validate question structure
          if (
            !mongoQuestion.question ||
            !mongoQuestion.choices ||
            !("answer_key" in mongoQuestion)
          ) {
            console.warn(
              `⚠️  Skipping question ${index + 1}: Missing required fields`
            );
            errorCount++;
            return null;
          }

          successCount++;

          return {
            id: successCount,
            question: mongoQuestion.question,
            choices: mongoQuestion.choices,
            correctAnswerIndex: mongoQuestion.answer_key,
            knowledge_area: mongoQuestion.knowledge_area,
            system_id: mongoQuestion.system_id,
            mongodb_id: mongoQuestion._id?.$oid,
          };
        } catch (error) {
          console.warn(
            `⚠️  Error transforming question ${index + 1}: ${error.message}`
          );
          errorCount++;
          return null;
        }
      })
      .filter((q) => q !== null);

    // Ensure database directory exists
    const dbDir = path.join(__dirname, "database");
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    // Write transformed questions to JSON file
    const outputPath = path.join(__dirname, "database", "questions.json");
    fs.writeFileSync(outputPath, JSON.stringify(transformedQuestions, null, 2));

    console.log(`\n✅ Migration completed successfully!`);
    console.log(`   ✓ Imported: ${successCount} questions`);
    console.log(`   ⚠️  Skipped: ${errorCount} questions`);
    console.log(`\n📊 Database file location: ${outputPath}`);
    console.log(
      `📏 File size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`
    );
    console.log(`\n🚀 You can now start the application with: npm start`);
  } catch (error) {
    console.error("❌ Migration failed:", error.message);
    process.exit(1);
  }
}

// Run migration
migrateData();
