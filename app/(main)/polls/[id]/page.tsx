// Server Component

export default async function PollDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  // For now, we'll return a placeholder since we're focusing on auth fixes
  // The poll fetching logic should be moved to a server component
  return (
    <div className='max-w-2xl mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Poll Details</h1>
      <div className='text-center py-8'>
        <p>
          Poll functionality will be implemented with proper server-side data
          fetching.
        </p>
        <p className='text-sm text-gray-500 mt-2'>Poll ID: {id}</p>
      </div>
    </div>
  );
}
