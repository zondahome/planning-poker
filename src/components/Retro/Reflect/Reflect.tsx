import { useState, useEffect, useRef } from 'react';
import { RetroSession, Reflection, ReflectionColumn, RetroPhase, RetroParticipant } from '../../../types/retro';
import { addReflection, streamRetroReflections, startReflectTimer, stopReflectTimer, pauseReflectTimer, resumeReflectTimer, setRetroPhase, setTypingStatus } from '../../../service/retro/retros';
import { isModerator } from '../../../utils/isModerator';

interface ReflectProps {
  retro: RetroSession;
  participants: RetroParticipant[];
  currentParticipantId?: string;
  currentParticipantName?: string;
}

const columnConfig = {
  [ReflectionColumn.Kudos]: {
    label: 'Kudos',
    color: 'blue',
    bgClass: 'bg-blue-100 dark:bg-blue-900/20',
    borderClass: 'border-blue-300 dark:border-blue-700',
    dotClass: 'bg-blue-500',
  },
  [ReflectionColumn.TalkingPoints]: {
    label: 'Talking Points',
    color: 'orange',
    bgClass: 'bg-orange-100 dark:bg-orange-900/20',
    borderClass: 'border-orange-300 dark:border-orange-700',
    dotClass: 'bg-orange-500',
  },
  [ReflectionColumn.WhatDidntGoWell]: {
    label: "What Didn't Go Well",
    color: 'red',
    bgClass: 'bg-red-100 dark:bg-red-900/20',
    borderClass: 'border-red-300 dark:border-red-700',
    dotClass: 'bg-red-500',
  },
  [ReflectionColumn.WhatWentWell]: {
    label: 'What Went Well',
    color: 'green',
    bgClass: 'bg-green-100 dark:bg-green-900/20',
    borderClass: 'border-green-300 dark:border-green-700',
    dotClass: 'bg-green-500',
  },
};

export const Reflect: React.FC<ReflectProps> = ({
  retro,
  participants,
  currentParticipantId,
  currentParticipantName,
}) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [newReflection, setNewReflection] = useState<{ [key: string]: string }>({});
  const [timerMinutes, setTimerMinutes] = useState<number>(5);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const typingTimeoutRef = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const isCurrentUserModerator = isModerator(
    currentParticipantId || '',
    retro.createdById,
    retro.isAllowMembersToManageSession
  );

  const timerActive = retro.reflectTimerStart && retro.reflectTimerDuration;
  const timerPaused = retro.reflectTimerPaused || false;

  useEffect(() => {
    const unsubscribe = streamRetroReflections(retro.id).onSnapshot((snap) => {
      const list: Reflection[] = [];
      snap.forEach((doc) => {
        const data = doc.data() as Reflection;
        list.push({
          ...data,
          createdAt: (data.createdAt as any).toDate(),
        });
      });
      setReflections(list);
    });
    return () => unsubscribe();
  }, [retro.id]);

  useEffect(() => {
    if (!timerActive || timerPaused) return;

    const interval = setInterval(() => {
      const startTime = (retro.reflectTimerStart as any).toDate().getTime();
      const duration = (retro.reflectTimerDuration || 0) * 60 * 1000;
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((duration - elapsed) / 1000));

      const previousRemaining = remainingSeconds;
      setRemainingSeconds(remaining);

      if (remaining === 0 && previousRemaining > 0) {
        clearInterval(interval);
        playDingSound();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [timerActive, timerPaused, retro.reflectTimerStart, retro.reflectTimerDuration, remainingSeconds]);

  const handleAddReflection = async (column: ReflectionColumn) => {
    const content = newReflection[column]?.trim();
    if (!content || !currentParticipantName || !currentParticipantId) return;

    await addReflection(retro.id, column, content, currentParticipantName);
    setNewReflection({ ...newReflection, [column]: '' });

    // Clear typing status
    await setTypingStatus(retro.id, currentParticipantId, null);
    if (typingTimeoutRef.current[column]) {
      clearTimeout(typingTimeoutRef.current[column]);
      delete typingTimeoutRef.current[column];
    }
  };

  const handleTextChange = (column: ReflectionColumn, value: string) => {
    setNewReflection({ ...newReflection, [column]: value });

    if (!currentParticipantId) return;

    // Clear existing timeout for this column
    if (typingTimeoutRef.current[column]) {
      clearTimeout(typingTimeoutRef.current[column]);
    }

    if (value.trim()) {
      // User is typing - set typing status
      setTypingStatus(retro.id, currentParticipantId, column);

      // Clear typing status after 2 seconds of inactivity
      typingTimeoutRef.current[column] = setTimeout(() => {
        setTypingStatus(retro.id, currentParticipantId, null);
        delete typingTimeoutRef.current[column];
      }, 2000);
    } else {
      // Empty input - clear typing status
      setTypingStatus(retro.id, currentParticipantId, null);
      delete typingTimeoutRef.current[column];
    }
  };

  // Cleanup typing status on unmount
  useEffect(() => {
    return () => {
      if (currentParticipantId) {
        setTypingStatus(retro.id, currentParticipantId, null);
      }
      Object.values(typingTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, [retro.id, currentParticipantId]);

  const handleStartTimer = async () => {
    if (timerMinutes > 0) {
      await startReflectTimer(retro.id, timerMinutes);
    }
  };

  const handlePauseTimer = async () => {
    await pauseReflectTimer(retro.id);
  };

  const handleResumeTimer = async () => {
    await resumeReflectTimer(retro.id);
  };

  const handleStopTimer = async () => {
    await stopReflectTimer(retro.id);
  };

  const handleCompletePhase = async () => {
    await setRetroPhase(retro.id, RetroPhase.Group);
  };

  const playDingSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create a pleasant "ding" sound using multiple frequencies
      const createTone = (frequency: number, startTime: number, duration: number, volume: number) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      // Play a pleasant two-tone "ding" (like a notification bell)
      createTone(800, now, 0.15, 0.3);
      createTone(1200, now + 0.08, 0.15, 0.2);
    } catch (error) {
      console.error('Failed to play ding sound:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColumnReflections = (column: ReflectionColumn) =>
    reflections.filter((r) => r.column === column);

  const getTypingCount = (column: ReflectionColumn) =>
    participants.filter((p) => p.currentlyTypingIn === column && p.id !== currentParticipantId)
      .length;

  return (
    <div className='h-full flex flex-col'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold'>Reflect</h1>
          <p className='text-sm text-gray-600 dark:text-gray-400'>
            Add anonymous reflections for each prompt
          </p>
        </div>

        <div className='flex items-center gap-3'>
          {/* Timer Display - Visible to Everyone */}
          {timerActive && (
            <div className='flex items-center gap-3'>
              <div className={`text-2xl font-mono font-bold ${remainingSeconds <= 60 ? 'text-red-600 animate-pulse' : 'text-gray-900 dark:text-gray-100'}`}>
                ⏱️ {formatTime(remainingSeconds)}
              </div>
              {timerPaused && (
                <span className='text-sm text-yellow-600 dark:text-yellow-400 font-medium'>
                  (Paused)
                </span>
              )}
            </div>
          )}

          {/* Timer Controls - Facilitator Only */}
          {isCurrentUserModerator && (
            <>
              {!timerActive ? (
                <>
                  <input
                    type='number'
                    min='1'
                    max='60'
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 5)}
                    className='w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm'
                    placeholder='5'
                  />
                  <span className='text-sm text-gray-600 dark:text-gray-400'>minutes</span>
                  <button
                    onClick={handleStartTimer}
                    className='px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium'
                  >
                    Start Timer
                  </button>
                </>
              ) : (
                <>
                  {!timerPaused ? (
                    <button
                      onClick={handlePauseTimer}
                      className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-sm font-medium'
                    >
                      Pause
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeTimer}
                      className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm font-medium'
                    >
                      Resume
                    </button>
                  )}
                  <button
                    onClick={handleStopTimer}
                    className='px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm font-medium'
                  >
                    Stop
                  </button>
                </>
              )}
              <button
                onClick={handleCompletePhase}
                className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition text-sm font-medium'
              >
                Phase Completed
              </button>
            </>
          )}
        </div>
      </div>

      <div className='flex-1 grid grid-cols-4 gap-4 overflow-y-auto'>
        {(Object.keys(columnConfig) as ReflectionColumn[]).map((column) => {
          const config = columnConfig[column];
          const columnReflections = getColumnReflections(column);
          const typingCount = getTypingCount(column);
          const reflectionCount = columnReflections.length;

          return (
            <div
              key={column}
              className={`flex flex-col ${config.bgClass} rounded-lg p-4 border ${config.borderClass}`}
            >
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-2'>
                  <div className={`w-2 h-2 rounded-full ${config.dotClass}`}></div>
                  <h3 className='font-semibold text-sm'>{config.label}</h3>
                </div>
                <div className='flex items-center gap-2'>
                  {typingCount > 0 && (
                    <span className='text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1'>
                      <span className='inline-block w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full animate-pulse'></span>
                      {typingCount} typing...
                    </span>
                  )}
                  <span className='text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 px-2 py-1 rounded-full'>
                    {reflectionCount}
                  </span>
                </div>
              </div>

              <div className='flex-1 mb-4 overflow-y-auto'>
                {reflectionCount > 0 && (
                  <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
                    <div className='text-3xl mb-2'>🔒</div>
                    <p className='text-sm'>
                      {reflectionCount} {reflectionCount === 1 ? 'reflection' : 'reflections'}
                    </p>
                    <p className='text-xs mt-1'>Hidden until grouping phase</p>
                  </div>
                )}
              </div>

              <div className='mt-auto'>
                <textarea
                  value={newReflection[column] || ''}
                  onChange={(e) => handleTextChange(column, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      e.preventDefault();
                      handleAddReflection(column);
                    }
                  }}
                  placeholder='Share your thoughts'
                  className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm resize-none bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  rows={3}
                />
                <button
                  onClick={() => handleAddReflection(column)}
                  disabled={!newReflection[column]?.trim()}
                  className='mt-2 w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Add
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
