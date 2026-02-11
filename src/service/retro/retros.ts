import { ulid } from 'ulid';
import { addRetroToStore, addParticipantToRetroInStore, streamRetro, streamParticipants, getRetroFromStore, updateRetroInStore, updateParticipantInStore, addReflectionToStore, streamReflections, deleteReflectionFromStore } from '../../repository/retro/firebaseRetro';
import { addRetroSessionToCache, getCurrentParticipantId } from '../../repository/retro/localStorageRetro';
import { NewRetroSession, RetroParticipant, RetroSession, RetroStatus, RetroPhase, TeamHealthMood, Reflection, ReflectionColumn } from '../../types/retro';

export const addNewRetro = async (newRetro: NewRetroSession): Promise<string> => {
  const participant: RetroParticipant = {
    id: ulid(),
    name: newRetro.createdBy,
    joinedAt: new Date(),
  };
  const retro: RetroSession = {
    id: ulid(),
    name: newRetro.name,
    createdBy: newRetro.createdBy,
    createdById: participant.id,
    createdAt: newRetro.createdAt,
    status: RetroStatus.Open,
    isAllowMembersToManageSession: newRetro.isAllowMembersToManageSession,
    currentPhase: RetroPhase.Icebreaker,
    teamHealthRevealed: false,
  };
  await addRetroToStore(retro.id, retro);
  await addParticipantToRetroInStore(retro.id, participant);
  addRetroSessionToCache({
    id: retro.id,
    name: retro.name,
    createdBy: retro.createdBy,
    createdById: retro.createdById,
    participantId: participant.id,
    isAllowMembersToManageSession: retro.isAllowMembersToManageSession,
  });
  return retro.id;
};

export const addParticipantToRetro = async (retroId: string, name: string): Promise<boolean> => {
  const retro = await getRetroFromStore(retroId);
  if (!retro) return false;
  const participant: RetroParticipant = { id: ulid(), name, joinedAt: new Date() };
  await addParticipantToRetroInStore(retroId, participant);
  addRetroSessionToCache({
    id: retro.id,
    name: retro.name,
    createdBy: retro.createdBy,
    createdById: retro.createdById,
    participantId: participant.id,
    isAllowMembersToManageSession: retro.isAllowMembersToManageSession,
  });
  return true;
};

export const streamRetroSession = (id: string) => streamRetro(id);
export const streamRetroParticipants = (id: string) => streamParticipants(id);
export const getCurrentRetroParticipantId = getCurrentParticipantId;

export const setRetroPhase = async (retroId: string, phase: RetroPhase): Promise<boolean> => {
  await updateRetroInStore(retroId, { currentPhase: phase });
  return true;
};

export const setTeamHealthVote = async (
  retroId: string,
  participantId: string,
  mood: TeamHealthMood
): Promise<boolean> => {
  await updateParticipantInStore(retroId, participantId, { teamHealthVote: mood });
  return true;
};

export const revealTeamHealth = async (retroId: string, revealed: boolean): Promise<boolean> => {
  await updateRetroInStore(retroId, { teamHealthRevealed: revealed });
  return true;
};

export const addReflection = async (
  retroId: string,
  column: ReflectionColumn,
  content: string,
  createdBy: string
): Promise<string> => {
  const reflection: Reflection = {
    id: ulid(),
    column,
    content,
    createdBy,
    createdAt: new Date(),
  };
  await addReflectionToStore(retroId, reflection);
  return reflection.id;
};

export const streamRetroReflections = (retroId: string) => streamReflections(retroId);

export const deleteReflection = async (retroId: string, reflectionId: string): Promise<boolean> => {
  await deleteReflectionFromStore(retroId, reflectionId);
  return true;
};

export const startReflectTimer = async (retroId: string, durationMinutes: number): Promise<boolean> => {
  await updateRetroInStore(retroId, {
    reflectTimerStart: new Date(),
    reflectTimerDuration: durationMinutes,
    reflectTimerPaused: false,
  });
  return true;
};

export const pauseReflectTimer = async (retroId: string): Promise<boolean> => {
  await updateRetroInStore(retroId, { reflectTimerPaused: true });
  return true;
};

export const resumeReflectTimer = async (retroId: string): Promise<boolean> => {
  await updateRetroInStore(retroId, { reflectTimerPaused: false });
  return true;
};

export const stopReflectTimer = async (retroId: string): Promise<boolean> => {
  await updateRetroInStore(retroId, {
    reflectTimerStart: undefined,
    reflectTimerDuration: undefined,
    reflectTimerPaused: false,
  });
  return true;
};

export const setTypingStatus = async (
  retroId: string,
  participantId: string,
  column: ReflectionColumn | null
): Promise<boolean> => {
  await updateParticipantInStore(retroId, participantId, { currentlyTypingIn: column });
  return true;
};
