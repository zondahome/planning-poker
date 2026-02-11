import { Status } from './status';

// Initial retro session status limited to Open for scaffolding; future: Locked, Archived, etc.
export enum RetroStatus {
  Open = 'Open',
}

export enum RetroPhase {
  Icebreaker = 'Icebreaker',
  TeamHealth = 'TeamHealth',
  Reflect = 'Reflect',
  Group = 'Group',
  Vote = 'Vote',
  Discuss = 'Discuss',
}

export enum TeamHealthMood {
  Happy = 'happy',
  Neutral = 'neutral',
  Sad = 'sad',
}

export interface TeamHealthVote {
  participantId: string;
  mood: TeamHealthMood;
  votedAt: Date;
}

export enum ReflectionColumn {
  Kudos = 'Kudos',
  TalkingPoints = 'TalkingPoints',
  WhatDidntGoWell = 'WhatDidntGoWell',
  WhatWentWell = 'WhatWentWell',
}

export interface Reflection {
  id: string;
  column: ReflectionColumn;
  content: string;
  createdBy: string;
  createdAt: Date;
}

export interface RetroSession {
  id: string;
  name: string;
  createdBy: string;
  createdById: string;
  createdAt: Date;
  updatedAt?: Date;
  status: RetroStatus;
  isAllowMembersToManageSession?: boolean;
  currentPhase?: RetroPhase;
  teamHealthRevealed?: boolean;
  reflectTimerStart?: Date;
  reflectTimerDuration?: number;
  reflectTimerPaused?: boolean;
}

export interface NewRetroSession {
  name: string;
  createdBy: string;
  createdAt: Date;
  isAllowMembersToManageSession?: boolean;
}

export interface RetroParticipant {
  id: string;
  name: string;
  joinedAt: Date;
  teamHealthVote?: TeamHealthMood;
  currentlyTypingIn?: ReflectionColumn | null;
}
