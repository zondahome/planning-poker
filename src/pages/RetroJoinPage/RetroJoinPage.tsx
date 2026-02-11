import { FormEvent, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { getRetroFromStore } from '../../repository/retro/firebaseRetro';
import { addParticipantToRetro, getCurrentRetroParticipantId } from '../../service/retro/retros';

export const RetroJoinPage = () => {
  const history = useHistory();
  const { id } = useParams<{ id: string }>();
  const [retroId, setRetroId] = useState(id);
  const [name, setName] = useState(() => localStorage.getItem('recentRetroParticipantName') || '');
  const [retroFound, setRetroFound] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showNotExistMessage, setShowNotExistMessage] = useState(false);

  useEffect(() => {
    async function fetch() {
      if (retroId) {
        const retro = await getRetroFromStore(retroId);
        if (retro) {
          setRetroFound(true);
          const existing = getCurrentRetroParticipantId(retroId);
            if (existing) {
              history.push(`/retro/${retroId}`);
            }
        } else {
          setShowNotExistMessage(true);
          setTimeout(() => history.push('/'), 5000);
        }
      }
    }
    fetch();
  }, [retroId, history]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!retroId) return;
    setLoading(true);
    localStorage.setItem('recentRetroParticipantName', name);
    const ok = await addParticipantToRetro(retroId, name);
    setLoading(false);
    if (ok) {
      history.push(`/retro/${retroId}`);
    } else {
      setRetroFound(false);
    }
  };

  return (
    <div className='w-full'>
      <form onSubmit={handleSubmit} className='w-full flex justify-center'>
        <div className='w-full max-w-lg border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-6'>
          <h2 className='text-2xl font-bold mb-4 text-center'>Join Retro</h2>
          <div className='flex flex-col gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>Retro ID</label>
              <input
                required
                value={retroId || ''}
                onChange={(e) => setRetroId(e.target.value)}
                placeholder='abc...'
                className={`w-full border border-gray-400 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400 ${!retroFound ? 'border-red-500' : ''}`}
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Your Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Enter your name'
                className='w-full border border-gray-400 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400'
              />
            </div>
          </div>
          {!retroFound && (
            <p className='text-xs text-red-600 mt-2'>Retro not found, check the ID</p>
          )}
          <div className='flex justify-end mt-6'>
            <button
              type='submit'
              className={`bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join'}
            </button>
          </div>
        </div>
      </form>
      {showNotExistMessage && (
        <div className='fixed top-6 right-6 z-50'>
          <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow' role='alert'>
            <span className='block font-bold'>Retro was deleted and doesn't exist anymore!</span>
          </div>
        </div>
      )}
    </div>
  );
};
