import { RetroParticipant, RetroSession, TeamHealthMood } from '../../../types/retro';
import { setTeamHealthVote, revealTeamHealth } from '../../../service/retro/retros';
import { isModerator } from '../../../utils/isModerator';

interface TeamHealthProps {
  retro: RetroSession;
  participants: RetroParticipant[];
  currentParticipantId?: string;
}

const moodEmojis = {
  [TeamHealthMood.Happy]: '😄',
  [TeamHealthMood.Neutral]: '😐',
  [TeamHealthMood.Sad]: '😢',
};

const moodLabels = {
  [TeamHealthMood.Happy]: 'Great!',
  [TeamHealthMood.Neutral]: 'Okay',
  [TeamHealthMood.Sad]: 'Not great',
};

export const TeamHealth: React.FC<TeamHealthProps> = ({
  retro,
  participants,
  currentParticipantId,
}) => {
  const isCurrentUserModerator = isModerator(
    currentParticipantId || '',
    retro.createdById,
    retro.isAllowMembersToManageSession
  );

  const currentParticipant = participants.find((p) => p.id === currentParticipantId);
  const revealed = retro.teamHealthRevealed || false;

  const handleVote = async (mood: TeamHealthMood) => {
    if (!currentParticipantId) return;
    await setTeamHealthVote(retro.id, currentParticipantId, mood);
  };

  const handleReveal = async () => {
    if (!isCurrentUserModerator) return;
    await revealTeamHealth(retro.id, !revealed);
  };

  // Count votes by mood
  const voteCounts = {
    [TeamHealthMood.Happy]: 0,
    [TeamHealthMood.Neutral]: 0,
    [TeamHealthMood.Sad]: 0,
  };

  participants.forEach((p) => {
    if (p.teamHealthVote) {
      voteCounts[p.teamHealthVote]++;
    }
  });

  const totalVotes = participants.filter((p) => p.teamHealthVote).length;
  const allVoted = totalVotes === participants.length && participants.length > 0;

  return (
    <div className='max-w-3xl mx-auto'>
      <div className='flex items-center justify-between mb-6'>
        <h1 className='text-2xl font-semibold'>Team Health</h1>
        {isCurrentUserModerator && (
          <button
            onClick={handleReveal}
            disabled={totalVotes === 0}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              revealed
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {revealed ? 'Hide Results' : 'Reveal Results'}
          </button>
        )}
      </div>

      {isCurrentUserModerator && allVoted && !revealed && (
        <div className='mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-800 dark:text-green-200'>
          ✓ All participants have voted. You can now reveal the results.
        </div>
      )}

      <div className='bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg p-8'>
        <div className='text-center mb-8'>
          <h2 className='text-xl font-medium mb-2'>How are you feeling about work today?</h2>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            {revealed
              ? 'Results are revealed'
              : `${totalVotes} of ${participants.length} voted`}
          </p>
        </div>

        <div className='flex justify-center gap-6 mb-8'>
          {(Object.keys(moodEmojis) as TeamHealthMood[]).map((mood) => {
            const isSelected = currentParticipant?.teamHealthVote === mood;
            const count = voteCounts[mood];

            return (
              <button
                key={mood}
                onClick={() => handleVote(mood)}
                disabled={revealed}
                className={`relative flex flex-col items-center justify-center w-32 h-40 rounded-2xl border-2 transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 scale-105'
                    : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:scale-105'
                } ${revealed ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className='text-5xl mb-3'>{moodEmojis[mood]}</div>
                <div className='text-sm font-medium text-gray-700 dark:text-gray-300'>
                  {moodLabels[mood]}
                </div>
                {revealed && (
                  <div className='absolute top-3 right-3 bg-indigo-600 text-white text-sm font-bold rounded-full h-8 w-8 flex items-center justify-center'>
                    {count}
                  </div>
                )}
                {!revealed && isSelected && (
                  <div className='absolute -top-2 -right-2 bg-indigo-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center'>
                    ✓
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className='text-center text-sm text-gray-500 dark:text-gray-400 mt-4'>
          {revealed
            ? 'Results shown above'
            : 'Your vote is hidden until the facilitator reveals the results'}
        </div>
      </div>
    </div>
  );
};
