import * as SQLite from 'expo-sqlite';

export type Companion = 'Mora' | 'Mailo';

export type ChildProfile = {
  id: number;
  name: string;
  companion: Companion;
};

export type ReadingProgress = {
  profileId: number;
  storyId: string;
  pageIndex: number;
  completed: boolean;
  updatedAt: string;
};

type ReadingProgressRow = Omit<ReadingProgress, 'completed'> & {
  completed: number;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

async function getDatabase() {
  if (!databasePromise) {
    databasePromise = (async () => {
      const database = await SQLite.openDatabaseAsync('mm-reading.db');
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        PRAGMA foreign_keys = ON;
        CREATE TABLE IF NOT EXISTS profiles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          companion TEXT NOT NULL CHECK (companion IN ('Mora', 'Mailo')),
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS reading_progress (
          profile_id INTEGER NOT NULL,
          story_id TEXT NOT NULL,
          page_index INTEGER NOT NULL DEFAULT 0,
          completed INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL,
          PRIMARY KEY (profile_id, story_id),
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        );
        CREATE TABLE IF NOT EXISTS reading_rewards (
          profile_id INTEGER NOT NULL,
          story_id TEXT NOT NULL,
          page_index INTEGER NOT NULL,
          awarded_at TEXT NOT NULL,
          PRIMARY KEY (profile_id, story_id, page_index),
          FOREIGN KEY (profile_id) REFERENCES profiles(id) ON DELETE CASCADE
        );
      `);
      return database;
    })();
  }

  return databasePromise;
}

export async function getProfiles(): Promise<ChildProfile[]> {
  const database = await getDatabase();
  return database.getAllAsync<ChildProfile>(
    'SELECT id, name, companion FROM profiles ORDER BY created_at, id'
  );
}

export async function createProfile(name: string, companion: Companion) {
  const database = await getDatabase();
  const result = await database.runAsync(
    'INSERT INTO profiles (name, companion) VALUES (?, ?)',
    name,
    companion
  );

  return { id: result.lastInsertRowId, name, companion } satisfies ChildProfile;
}

export async function getProfileProgress(profileId: number): Promise<ReadingProgress[]> {
  const database = await getDatabase();
  const rows = await database.getAllAsync<ReadingProgressRow>(
    `SELECT
      profile_id AS profileId,
      story_id AS storyId,
      page_index AS pageIndex,
      completed,
      updated_at AS updatedAt
    FROM reading_progress
    WHERE profile_id = ?`,
    profileId
  );

  return rows.map((row) => ({ ...row, completed: row.completed === 1 }));
}

export async function getStoryProgress(profileId: number, storyId: string) {
  const database = await getDatabase();
  const row = await database.getFirstAsync<ReadingProgressRow>(
    `SELECT
      profile_id AS profileId,
      story_id AS storyId,
      page_index AS pageIndex,
      completed,
      updated_at AS updatedAt
    FROM reading_progress
    WHERE profile_id = ? AND story_id = ?`,
    profileId,
    storyId
  );

  return row ? { ...row, completed: row.completed === 1 } : null;
}

export async function saveStoryProgress(
  profileId: number,
  storyId: string,
  pageIndex: number,
  completed: boolean
) {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO reading_progress (profile_id, story_id, page_index, completed, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT (profile_id, story_id) DO UPDATE SET
      page_index = excluded.page_index,
      completed = excluded.completed,
      updated_at = excluded.updated_at`,
    profileId,
    storyId,
    pageIndex,
    completed ? 1 : 0,
    new Date().toISOString()
  );
}

export async function getProfileStarCount(profileId: number) {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM reading_rewards WHERE profile_id = ?',
    profileId
  );

  return result?.total ?? 0;
}

export async function awardReadingStar(profileId: number, storyId: string, pageIndex: number) {
  const database = await getDatabase();
  const result = await database.runAsync(
    `INSERT INTO reading_rewards (profile_id, story_id, page_index, awarded_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (profile_id, story_id, page_index) DO NOTHING`,
    profileId,
    storyId,
    pageIndex,
    new Date().toISOString()
  );
  const totalStars = await getProfileStarCount(profileId);

  return { awarded: result.changes > 0, totalStars };
}
