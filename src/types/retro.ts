import { Status } from './status';

// Initial retro session status limited to Open for scaffolding; future: Locked, Archived, etc.
export enum RetroStatus {
  Open = 'Open',
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
}
