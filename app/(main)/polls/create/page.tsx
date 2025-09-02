'use client';

import PollForm from '@/components/poll-form';

export default function CreatePollPage() {
  const handleSubmit = (data: any) => {
    // TODO: Implement poll creation with Server Actions
    console.log('Poll data:', data);
  };

  return (
    <div className='flex justify-center items-center h-screen'>
      <div className='w-full max-w-md'>
        <h1 className='text-2xl font-bold text-center mb-6'>Create New Poll</h1>
        <PollForm onSubmit={handleSubmit} />
      </div>
    </div>
  );
}
