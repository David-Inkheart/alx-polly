import { getPolls } from '@/lib/actions/polls';
import PollsClient from '@/components/polls-client';

export const dynamic = 'force-dynamic';

export default async function PollsPage() {
  try {
    const polls = await getPolls();
    return <PollsClient initialPolls={polls} />;
  } catch (error) {
    console.error('Error fetching polls:', error);
    return <PollsClient initialPolls={[]} error='Failed to load polls' />;
  }
}
