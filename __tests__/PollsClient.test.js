import React from 'react';
import { render, screen } from '@testing-library/react';
import PollsClient from '@/components/polls-client';

// Mock the Supabase client directly in the test file
jest.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: jest.fn(() => ({
    auth: {
      getUser: jest
        .fn()
        .mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    },
  })),
}));

jest.mock('../lib/actions/polls', () => ({
  getPolls: jest.fn(),
  deletePoll: jest.fn(),
}));

jest.mock('../lib/actions/auth', () => ({
  signOut: jest.fn(),
}));

describe('PollsClient', () => {
  it('renders the main heading', async () => {
    render(<PollsClient initialPolls={[]} />);
    const heading = await screen.findByRole('heading', { name: /Polls Dashboard/i });
    expect(heading).toBeInTheDocument();
  });
});
