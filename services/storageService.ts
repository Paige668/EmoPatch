
import { get, set } from 'idb-keyval';
import { TriageRecord } from "../types";

const RECORD_KEY = 'soft_triage_records';
const STATS_KEY = 'soft_triage_stats';

export interface UserStats {
  sessionCount: number;
}

export const saveRecord = async (record: TriageRecord): Promise<void> => {
  try {
    // Check environment
    if (typeof window === 'undefined') return;
    
    const existing = (await get<TriageRecord[]>(RECORD_KEY)) || [];
    const updated = [record, ...existing];
    await set(RECORD_KEY, updated);
  } catch (e) {
    console.error("Failed to save record", e);
  }
};

export const getRecords = async (): Promise<TriageRecord[]> => {
  try {
     // Check environment
    if (typeof window === 'undefined') return [];
    
    return (await get<TriageRecord[]>(RECORD_KEY)) || [];
  } catch (e) {
    console.error("Failed to load records", e);
    return [];
  }
};

export const findRecordByText = async (text: string): Promise<TriageRecord | undefined> => {
  try {
    const records = await getRecords();
    const normalizedInput = text.trim();
    // Find the most recent record with matching text
    return records.find(r => r.capture.eventText.trim() === normalizedInput);
  } catch (e) {
    console.error("Failed to find record", e);
    return undefined;
  }
};

export const clearRecords = async (): Promise<void> => {
  try {
     if (typeof window === 'undefined') return;
     await set(RECORD_KEY, []);
  } catch (e) {
      console.error("Failed to clear records", e);
  }
};

// --- Gamification Stats ---

export const getUserStats = async (): Promise<UserStats> => {
  try {
    if (typeof window === 'undefined') return { sessionCount: 0 };
    const stats = await get<UserStats>(STATS_KEY);
    return stats || { sessionCount: 0 };
  } catch (e) {
    console.error("Failed to get stats", e);
    return { sessionCount: 0 };
  }
};

export const incrementUserSession = async (): Promise<void> => {
  try {
    if (typeof window === 'undefined') return;
    const stats = await getUserStats();
    await set(STATS_KEY, { sessionCount: stats.sessionCount + 1 });
  } catch (e) {
    console.error("Failed to increment session", e);
  }
};
