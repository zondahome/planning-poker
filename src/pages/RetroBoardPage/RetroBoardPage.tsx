import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { streamRetroSession, streamRetroParticipants, getCurrentRetroParticipantId, setRetroPhase } from '../../service/retro/retros';
import { RetroParticipant, RetroSession, RetroPhase } from '../../types/retro';
import { RetroSidebar } from '../../components/Retro/Sidebar/RetroSidebar';
import { TeamHealth } from '../../components/Retro/TeamHealth/TeamHealth';
import { Reflect } from '../../components/Retro/Reflect/Reflect';

export const RetroBoardPage = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [retro, setRetro] = useState<RetroSession | undefined>();
  const [participants, setParticipants] = useState<RetroParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const participantId = getCurrentRetroParticipantId(id);
    if (!participantId) {
      history.push(`/retro/join/${id}`);
    }
    const unsubRetro = streamRetroSession(id).onSnapshot((doc) => {
      if (doc.exists) {
        setRetro(doc.data() as RetroSession);
        setLoading(false);
      } else {
        setLoading(false);
      }
    });
    const unsubParticipants = streamRetroParticipants(id).onSnapshot((snap) => {
      const list: RetroParticipant[] = [];
      snap.forEach((d) => list.push(d.data() as RetroParticipant));
      setParticipants(list);
    });
    return () => {
      unsubRetro();
      unsubParticipants();
    };
  }, [id, history]);

  if (loading) {
    return <div className='flex items-center justify-center p-10'>Loading...</div>;
  }
  if (!retro) {
    return <div className='p-6 text-center'>Retro not found</div>;
  }

  const currentPhase = retro.currentPhase || RetroPhase.Icebreaker;
  const currentParticipantId = getCurrentRetroParticipantId(id);
  const currentParticipant = participants.find((p) => p.id === currentParticipantId);

  const handlePhaseChange = async (phase: RetroPhase) => {
    await setRetroPhase(id, phase);
  };

  const renderPhaseContent = () => {
    switch (currentPhase) {
      case RetroPhase.Icebreaker:
        return (
          <div className='max-w-3xl mx-auto'>
            <section className='mb-10'>
              <h1 className='text-2xl font-semibold mb-6'>Icebreaker</h1>
              <div className='flex flex-col items-center text-center bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow p-10'>
                <div className='h-36 w-36 rounded-full bg-indigo-200 dark:bg-indigo-600 flex items-center justify-center text-5xl font-bold mb-6'>
                  {retro.name.slice(0,2).toUpperCase()}
                </div>
                <p className='italic mb-4'>Welcome, {retro.createdBy}!</p>
                <p className='text-lg max-w-xl leading-relaxed mb-8'>Do you have a favorite mug? Let us see it and tell us why you love it!</p>
                <div className='w-full max-w-md bg-indigo-50 dark:bg-indigo-950/40 rounded-lg p-6 border border-indigo-100 dark:border-indigo-800'>
                  <p className='text-xs font-semibold tracking-wide mb-3 text-indigo-600 dark:text-indigo-300'>Modify current icebreaker (future)</p>
                  <div className='flex flex-wrap gap-2'>
                    <button className='px-3 py-1 rounded-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'>More serious</button>
                    <button className='px-3 py-1 rounded-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'>Funnier</button>
                    <button className='px-3 py-1 rounded-full text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm'>More exciting</button>
                    <button disabled className='px-4 py-1 rounded-full text-xs font-medium bg-indigo-200 dark:bg-indigo-700 text-gray-800 dark:text-gray-100 cursor-not-allowed'>Approve</button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        );
      case RetroPhase.TeamHealth:
        return (
          <TeamHealth
            retro={retro}
            participants={participants}
            currentParticipantId={currentParticipantId}
          />
        );
      case RetroPhase.Reflect:
        return (
          <Reflect
            retro={retro}
            participants={participants}
            currentParticipantId={currentParticipantId}
            currentParticipantName={currentParticipant?.name}
          />
        );
      default:
        return <div className='text-center text-gray-500'>This phase is not yet implemented.</div>;
    }
  };

  const isReflectPhase = currentPhase === RetroPhase.Reflect;

  return (
    <div className='flex h-[calc(100vh-64px)]'>
      <RetroSidebar
        retro={retro}
        participants={participants}
        currentParticipantId={currentParticipantId}
        onPhaseChange={handlePhaseChange}
      />
      <div className={`flex-1 bg-gray-50 dark:bg-gray-950 ${isReflectPhase ? 'p-8' : 'overflow-y-auto p-8'}`}>
        {renderPhaseContent()}
      </div>
    </div>
  );
};
