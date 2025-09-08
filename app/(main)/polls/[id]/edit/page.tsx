/**
 * Server component for poll editing interface
 * Handles poll ownership verification and renders edit form
 */

import { getPollById } from '@/lib/actions/polls';
import PollEditForm from '@/components/poll-edit-form';
import Link from 'next/link';

/**
 * Props for the EditPollPage component
 */
interface EditPollPageProps {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering for real-time poll data
export const dynamic = 'force-dynamic';

/**
 * Poll editing page component
 * Verifies poll ownership and renders edit form with data protection features
 */
export default async function EditPollPage({ params }: EditPollPageProps) {
  // Extract poll ID from route parameters
  const { id } = await params;

  try {
    // Fetch poll data and verify ownership
    const poll = await getPollById(id);
    return <PollEditForm poll={poll} />;
  } catch (error) {
    console.error('Error fetching poll:', error);
    // Render error page for unauthorized access or non-existent polls
    return (
      <div className='container mx-auto p-4'>
        <div className='text-center py-8'>
          <h1 className='text-2xl font-bold mb-4'>Poll Not Found</h1>
          <p className='text-muted-foreground mb-4'>
            The poll you're trying to edit doesn't exist or you don't have
            permission to edit it.
          </p>
          <Link href='/polls' className='text-blue-500 hover:underline'>
            Back to Polls
          </Link>
        </div>
      </div>
    );
  }
}
