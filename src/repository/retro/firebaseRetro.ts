import firebase from 'firebase/app';
import 'firebase/firestore';
import { RetroParticipant, RetroSession, Reflection } from '../../types/retro';

const retrosCollection = 'retros';
const participantsSub = 'participants';
const reflectionsSub = 'reflections';

const db = firebase.firestore();

export const addRetroToStore = async (retroId: string, data: RetroSession) => {
  await db.collection(retrosCollection).doc(retroId).set(data);
  return true;
};

export const getRetroFromStore = async (id: string): Promise<RetroSession | undefined> => {
  const doc = await db.collection(retrosCollection).doc(id).get();
  if (doc.exists) return doc.data() as RetroSession;
  return undefined;
};

export const addParticipantToRetroInStore = async (
  retroId: string,
  participant: RetroParticipant,
) => {
  await db
    .collection(retrosCollection)
    .doc(retroId)
    .collection(participantsSub)
    .doc(participant.id)
    .set(participant);
  return true;
};

export const streamRetro = (id: string) => {
  return db.collection(retrosCollection).doc(id);
};

export const streamParticipants = (id: string) => {
  return db.collection(retrosCollection).doc(id).collection(participantsSub);
};

export const getParticipantsFromStore = async (
  retroId: string,
): Promise<RetroParticipant[]> => {
  const snap = await db
    .collection(retrosCollection)
    .doc(retroId)
    .collection(participantsSub)
    .get();
  const list: RetroParticipant[] = [];
  snap.forEach((d) => list.push(d.data() as RetroParticipant));
  return list;
};

export const updateRetroInStore = async (retroId: string, data: Partial<RetroSession>): Promise<boolean> => {
  await db.collection(retrosCollection).doc(retroId).update(data);
  return true;
};

export const updateParticipantInStore = async (
  retroId: string,
  participantId: string,
  data: Partial<RetroParticipant>
): Promise<boolean> => {
  await db
    .collection(retrosCollection)
    .doc(retroId)
    .collection(participantsSub)
    .doc(participantId)
    .update(data);
  return true;
};

export const addReflectionToStore = async (
  retroId: string,
  reflection: Reflection
): Promise<boolean> => {
  await db
    .collection(retrosCollection)
    .doc(retroId)
    .collection(reflectionsSub)
    .doc(reflection.id)
    .set(reflection);
  return true;
};

export const streamReflections = (retroId: string) => {
  return db
    .collection(retrosCollection)
    .doc(retroId)
    .collection(reflectionsSub)
    .orderBy('createdAt', 'asc');
};

export const deleteReflectionFromStore = async (
  retroId: string,
  reflectionId: string
): Promise<boolean> => {
  await db
    .collection(retrosCollection)
    .doc(retroId)
    .collection(reflectionsSub)
    .doc(reflectionId)
    .delete();
  return true;
};
