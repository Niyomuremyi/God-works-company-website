require("dotenv").config();

const { Client } = require("pg");

async function testDatabase() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    connectionTimeoutMillis: 30000,
  });

  try {
    console.log("Connecting to database...");

    await client.connect();

    console.log("Database connected successfully!");

    const result = await client.query(`
      SELECT current_database(), current_user, NOW()
    `);

    console.log(result.rows);
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED:");
    console.error(error);
  } finally {
    await client.end().catch(() => {});
  }
}

testDatabase();