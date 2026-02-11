import { ulid } from 'ulid';
import { addRetroToStore, addParticipantToRetroInStore, streamRetro, streamParticipants, getRetroFromStore } from '../../repository/retro/firebaseRetro';
import { addRetroSessionToCache, getCurrentParticipantId } from '../../repository/retro/localStorageRetro';
import { NewRetroSession, RetroParticipant, RetroSession, RetroStatus } from '../../types/retro';

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
