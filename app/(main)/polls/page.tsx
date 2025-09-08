/**
 * Server component for displaying user's polls dashboard
 * Fetches and displays all polls created by the authenticated user
 */

import { getPolls } from '@/lib/actions/polls';
import PollsClient from '@/components/polls-client';

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic';

/**
 * Main polls dashboard page component
 * Handles server-side data fetching and error states
 */
export default async function PollsPage() {
  try {
    // Fetch all polls for the current user
    const polls = await getPolls();
    return <PollsClient initialPolls={polls} />;
  } catch (error) {
    console.error('Error fetching polls:', error);
    // Render client component with error state
    return <PollsClient initialPolls={[]} error='Failed to load polls' />;
  }
}
