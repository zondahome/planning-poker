import { RetroSession } from '../../types/retro';

// Local cache parallels playerGames for quick rejoin of retros
// Structure: [{ id, name, createdBy, createdById, participantId }]
export interface RetroCacheEntry {
  id: string;
  name: string;
  createdBy: string;
  createdById: string;
  participantId: string;
  isAllowMembersToManageSession?: boolean;
}

const storeKey = 'retroSessions';

export const getRetroSessionsFromCache = (): RetroCacheEntry[] => {
  const raw = localStorage.getItem(storeKey);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as RetroCacheEntry[];
  } catch {
    return [];
  }
};

export const updateRetroSessionsInCache = (entries: RetroCacheEntry[]) => {
  localStorage.setItem(storeKey, JSON.stringify(entries));
};

export const addRetroSessionToCache = (entry: RetroCacheEntry) => {
  const existing = getRetroSessionsFromCache();
  existing.push(entry);
  updateRetroSessionsInCache(existing);
};

export const getCurrentParticipantId = (retroId: string): string | undefined => {
  return getRetroSessionsFromCache().find((r) => r.id === retroId)?.participantId;
};
