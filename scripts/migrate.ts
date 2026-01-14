import postgres from "postgres";
import { readFileSync } from "fs";
import { join } from "path";
import { env } from "../src/env.js";

const DATABASE_URL = env.DATABASE_URL;

async function migrate() {
  const sql = postgres(DATABASE_URL);

  try {
    // Read the migration file
    const migrationSQL = readFileSync(
      join(process.cwd(), "drizzle/0001_manifold_tables.sql"),
      "utf-8"
    );

    // Execute the migration
    await sql.unsafe(migrationSQL);

    console.log("✓ Migration successful!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
