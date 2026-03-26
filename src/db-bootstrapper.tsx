import React, { useEffect, useState } from 'react';
import { applyMigrations } from '@src/db/migration.ts';
import seedDatabase from '@src/db/seed.ts';
import LoadingScreen from '@src/components/LoadingScreen.tsx';

export default function DbBootstrapper({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initStarted = React.useRef(false);

  useEffect(() => {
    const initDb = async () => {
      if (initStarted.current) return;
      initStarted.current = true;

      try {
        await applyMigrations();
        await seedDatabase();
        setIsReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unknown database error");
      }
    };

    void initDb();
  }, []);

  if (error) throw new Error(error);
  if (!isReady) return <LoadingScreen/>;
  return <>{children}</>
}