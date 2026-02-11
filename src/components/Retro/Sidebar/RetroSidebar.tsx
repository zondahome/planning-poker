import { RetroParticipant, RetroSession, RetroPhase } from '../../../types/retro';

interface RetroSidebarProps {
  retro: RetroSession;
  participants: RetroParticipant[];
  currentParticipantId?: string;
  onPhaseChange: (phase: RetroPhase) => void;
}

const navSections = [
  { key: RetroPhase.Icebreaker, label: 'Icebreaker' },
  { key: RetroPhase.TeamHealth, label: 'Team Health' },
  { key: RetroPhase.Reflect, label: 'Reflect' },
  { key: RetroPhase.Group, label: 'Group', disabled: true },
  { key: RetroPhase.Vote, label: 'Vote', disabled: true },
  { key: RetroPhase.Discuss, label: 'Discuss', disabled: true },
];

export const RetroSidebar: React.FC<RetroSidebarProps> = ({
  retro,
  participants,
  currentParticipantId,
  onPhaseChange,
}) => {
  const currentPhase = retro.currentPhase || RetroPhase.Icebreaker;
  const isFacilitator = retro.createdById === currentParticipantId;

  return (
    <div className='w-56 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-full'>
      <div className='px-4 py-3 border-b border-gray-200 dark:border-gray-800'>
        <h2 className='font-semibold text-sm truncate flex items-center gap-2'>
          <span className='inline-flex items-center justify-center h-7 w-7 rounded-full bg-indigo-200 dark:bg-indigo-600 text-xs font-bold'>
            {retro.name.substring(0,2).toUpperCase()}
          </span>
          {retro.name}
        </h2>
        <p className='text-xs text-blue-600 dark:text-blue-400 mt-0.5'>
          {isFacilitator ? 'Facilitator' : 'Participant'}
        </p>
      </div>
      <nav className='flex-1 overflow-y-auto py-2 text-sm'>
        {navSections.map(sec => {
          const isActive = currentPhase === sec.key;
          const isDisabled = sec.disabled;

          return (
            <div
              key={sec.key}
              onClick={() => !isDisabled && onPhaseChange(sec.key)}
              className={`px-4 py-2 flex items-center gap-2 transition ${
                isDisabled
                  ? 'opacity-40 cursor-not-allowed'
                  : isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-medium cursor-pointer'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
              }`}
            >
              <span>{sec.label}</span>
            </div>
          );
        })}
        <div className='mt-4 px-4 text-[11px] uppercase tracking-wide text-gray-500'>Participants</div>
        <ul className='mt-1'>
          {participants.map(p => (
            <li key={p.id} className={`px-4 py-1 flex items-center gap-2 text-sm truncate ${p.id === currentParticipantId ? 'bg-indigo-50 dark:bg-indigo-700/30' : ''}`}>
              <span className='inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 text-[11px] font-semibold'>
                {p.name.slice(0,2).toUpperCase()}
              </span>
              <span className='truncate'>{p.name}</span>
            </li>
          ))}
          {participants.length === 0 && (
            <li className='px-4 py-2 text-xs italic text-gray-500'>No participants yet</li>
          )}
        </ul>
      </nav>
    </div>
  );
};
