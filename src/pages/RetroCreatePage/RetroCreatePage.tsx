import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { addNewRetro } from '../../service/retro/retros';
import { NewRetroSession } from '../../types/retro';

export const RetroCreatePage = () => {
  const history = useHistory();
  const [retroName, setRetroName] = useState('New Retro');
  const [facilitatorName, setFacilitatorName] = useState(
    () => localStorage.getItem('recentRetroName') || ''
  );
  const [allowMembersManage, setAllowMembersManage] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem('recentRetroName', facilitatorName);
    const payload: NewRetroSession = {
      name: retroName || 'Untitled Retro',
      createdBy: facilitatorName || 'Facilitator',
      createdAt: new Date(),
      isAllowMembersToManageSession: allowMembersManage,
    };
    const id = await addNewRetro(payload);
    setLoading(false);
    history.push(`/retro/${id}`);
  };

  return (
    <div className='w-full flex justify-center p-4'>
      <form
        onSubmit={handleSubmit}
        className='w-full max-w-lg border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-6'
      >
        <h2 className='text-2xl font-bold mb-4 text-center'>Create Retrospective</h2>
        <div className='flex flex-col gap-4'>
          <div>
            <label className='block text-sm font-medium mb-1'>Retro Name</label>
            <input
              required
              value={retroName}
              onChange={(e) => setRetroName(e.target.value)}
              placeholder='Enter a retro name'
              className='w-full border border-gray-400 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400'
            />
          </div>
          <div>
            <label className='block text-sm font-medium mb-1'>Your Name</label>
            <input
              required
              value={facilitatorName}
              onChange={(e) => setFacilitatorName(e.target.value)}
              placeholder='Enter your name'
              className='w-full border border-gray-400 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400'
            />
          </div>
          <div className='flex items-center gap-2'>
            <input
              id='allowMembersManage'
              type='checkbox'
              checked={allowMembersManage}
              onChange={(e) => setAllowMembersManage(e.target.checked)}
            />
            <label htmlFor='allowMembersManage' className='text-sm'>Allow members to manage session</label>
          </div>
        </div>
        <div className='flex justify-end mt-6'>
          <button
            type='submit'
            disabled={loading}
            className={`bg-blue-600 text-white px-6 py-2 rounded font-semibold shadow hover:bg-blue-700 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating...' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};
