import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Point this to wherever you saved your schema.ts
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  driver: 'expo', // We use 'expo' placeholder for local-only SQLite
  dbCredentials: {
    url: 'app.db',
  },
});