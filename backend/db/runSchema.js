const fs = require("fs");
const path = require("path");
const pool = require("../config/db");

async function runSchema() {
  try {
    const schema = fs.readFileSync(
      path.join(__dirname, "orders_schema.sql"),
      "utf8"
    );

    await pool.query(schema);

    console.log("Database schema created successfully");
  } catch (error) {
    console.error("Schema creation failed:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runSchema();