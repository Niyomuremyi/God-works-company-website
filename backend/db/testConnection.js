require("dotenv").config();

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});
console.log(process.env.DATABASE_URL)
async function testConnection() {
  try {
    console.log("Testing PostgreSQL connection...");

    const result = await pool.query(`
      SELECT
        current_database(),
        current_user,
        version()
    `);

    console.log("CONNECTED!");
    console.log(result.rows[0]);
  } catch (error) {
    console.error("CONNECTION FAILED");
    console.error("code:", error.code);
    console.error("message:", error.message);
    console.error("address:", error.address);
    console.error("port:", error.port);
  } finally {
    await pool.end();
  }
}

testConnection();