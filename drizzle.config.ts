import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  // Point this to wherever you saved your schema.ts
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'app.db',
  },
  verbose: true,
  strict: true,
});