import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import { getPolls as mockGetPolls, deletePoll as mockDeletePoll } from '@/lib/actions/polls';
import { signOut as mockSignOut } from '@/lib/actions/auth';

import PollsClient from '@/components/polls-client';
const mockGetUser = jest.fn();
jest.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: jest.fn(() => ({
    auth: {
      getUser: mockGetUser,
    },
  })),
}));

// Mock lib/actions/polls
jest.mock('@/lib/actions/polls', () => ({
  getPolls: jest.fn(),
  deletePoll: jest.fn(),
}));

// Mock lib/actions/auth
jest.mock('@/lib/actions/auth', () => ({
  signOut: jest.fn(),
}));

// Mock next/navigation
const mockPush = jest.fn();
const mockRefresh = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: mockPush,
    refresh: mockRefresh,
  })),
}));

// const mockGetPolls = require('@/lib/actions/polls').getPolls;
// const mockDeletePoll = require('@/lib/actions/polls').deletePoll;
// const mockSignOut = require('@/lib/actions/auth').signOut;

describe('PollsClient', () => {
  let originalConfirm;
  let originalAlert;

  beforeEach(() => {
    // Reset mocks before each test
    mockGetPolls.mockReset();
    mockDeletePoll.mockReset();
    mockSignOut.mockReset();
    mockPush.mockReset();
    mockRefresh.mockReset();
    mockGetUser.mockReset(); // Reset mockGetUser

    // Default mock implementations
    mockGetPolls.mockResolvedValue([]); // Default to no polls
    mockDeletePoll.mockResolvedValue({ success: true });
    mockSignOut.mockResolvedValue(undefined);
    mockGetUser.mockResolvedValue({ data: { user: { id: 'test-user-id' } } }); // Default user

    // Mock window.confirm and window.alert for tests that interact with them
    originalConfirm = window.confirm;
    originalAlert = window.alert;
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  afterEach(() => {
    // Restore original implementations after each test
    window.confirm = originalConfirm;
    window.alert = originalAlert;
  });

  it('renders the main heading', async () => {
    render(<PollsClient initialPolls={[]} />);
    const heading = await screen.findByRole('heading', { name: /Polls Dashboard/i });
    expect(heading).toBeInTheDocument();
  });

  // Positive Outcome: Renders polls when initialPolls is provided
  it('renders a list of polls when initialPolls are provided', async () => {
    const polls = [
      { id: '1', question: 'Poll 1', created_at: '2023-01-01', total_votes: 5, created_by: 'test-user-id', poll_options: [] },
      { id: '2', question: 'Poll 2', created_at: '2023-01-02', total_votes: 10, created_by: 'other-user-id', poll_options: [] },
    ];
    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i }); // Wait for initial render
    expect(screen.getByText('Poll 1')).toBeInTheDocument();
    expect(screen.getByText('Poll 2')).toBeInTheDocument();
    expect(screen.getByText('5 total votes')).toBeInTheDocument();
    expect(screen.getByText('10 total votes')).toBeInTheDocument();
  });

  // Negative Outcome: No polls message when initialPolls is empty
  it('displays "No polls found" message when initialPolls is empty', async () => {
    render(<PollsClient initialPolls={[]} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i }); // Wait for initial render
    expect(screen.getByText('No polls found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create Your First Poll/i })).toBeInTheDocument();
  });

  // Positive Outcome: "Create New Poll" button is present and navigates
  it('renders "Create New Poll" button and navigates to create page', async () => {
    render(<PollsClient initialPolls={[]} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });
    const createButton = screen.getByRole('link', { name: /Create New Poll/i });
    expect(createButton).toBeInTheDocument();
    expect(createButton).toHaveAttribute('href', '/polls/create');
  });

  // Positive Outcome: Logout functionality
  it('calls signOut and redirects on logout button click', async () => {
    render(<PollsClient initialPolls={[]} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });
    const logoutButton = screen.getByRole('button', { name: /Logout/i });

    fireEvent.click(logoutButton);
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  // Positive Outcome: Edit button visibility for owner
  it('shows edit button for polls created by the current user', async () => {
    const polls = [
      { id: '1', question: 'My Poll', created_at: '2023-01-01', total_votes: 0, created_by: 'test-user-id', poll_options: [] },
    ];
    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });
    expect(await screen.findByLabelText('Edit poll')).toBeInTheDocument();
  });

  // Negative Outcome: Edit button hidden for non-owner
  it('hides edit button for polls not created by the current user', async () => {
    const polls = [
      { id: '1', question: 'Other User\'s Poll', created_at: '2023-01-01', total_votes: 0, created_by: 'other-user-id', poll_options: [] },
    ];
    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });
    await waitFor(() => expect(screen.queryByLabelText('Edit poll')).not.toBeInTheDocument());
  });

  // Positive Outcome: Delete button visibility for owner
  it('shows delete button for polls created by the current user', async () => {
    const polls = [
      { id: '1', question: 'My Poll', created_at: '2023-01-01', total_votes: 0, created_by: 'test-user-id', poll_options: [] },
    ];
    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });
    expect(await screen.findByLabelText('Delete poll')).toBeInTheDocument();
  });

  // Negative Outcome: Delete button hidden for non-owner
  it('hides delete button for polls not created by the current user', async () => {
    const polls = [
      { id: '1', question: 'Other User\'s Poll', created_at: '2023-01-01', total_votes: 0, created_by: 'other-user-id', poll_options: [] },
    ];
    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });
    await waitFor(() => expect(screen.queryByLabelText('Delete poll')).not.toBeInTheDocument());
  });

  // Positive Outcome: Delete functionality (successful)
  it('calls deletePoll and removes poll from UI on successful deletion', async () => {
    const polls = [
      { id: '1', question: 'Poll to delete', created_at: '2023-01-01', total_votes: 0, created_by: 'test-user-id', poll_options: [] },
    ];
    mockDeletePoll.mockResolvedValue({ success: true });
    window.confirm = jest.fn(() => true); // Mock window.confirm to return true

    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });

    const deleteButton = await screen.findByLabelText('Delete poll');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(mockDeletePoll).toHaveBeenCalledWith('1');
    await waitForElementToBeRemoved(() => screen.queryByText('Poll to delete')); // Wait for poll to be removed
    expect(screen.queryByText('Poll to delete')).not.toBeInTheDocument();
  });

  // Negative Outcome: Delete functionality (cancelled)
  it('does not call deletePoll when deletion is cancelled', async () => {
    const polls = [
      { id: '1', question: 'Poll to keep', created_at: '2023-01-01', total_votes: 0, created_by: 'test-user-id', poll_options: [] },
    ];
    window.confirm = jest.fn(() => false); // Mock window.confirm to return false

    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });

    const deleteButton = await screen.findByLabelText('Delete poll');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(mockDeletePoll).not.toHaveBeenCalled();
    expect(screen.getByText('Poll to keep')).toBeInTheDocument(); // Poll should still be there
  });

  // Negative Outcome: Delete functionality (failed)
  it('shows an alert and keeps poll on UI when deletePoll fails', async () => {
    const polls = [
      { id: '1', question: 'Poll with failed deletion', created_at: '2023-01-01', total_votes: 0, created_by: 'test-user-id', poll_options: [] },
    ];
    mockDeletePoll.mockRejectedValue(new Error('Failed to delete'));
    window.alert = jest.fn(); // Mock window.alert

    render(<PollsClient initialPolls={polls} />);
    await screen.findByRole('heading', { name: /Polls Dashboard/i });

    const deleteButton = await screen.findByLabelText('Delete poll');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledTimes(1);
    expect(mockDeletePoll).toHaveBeenCalledWith('1');
    await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Failed to delete poll. Please try again.'));
    expect(screen.getByText('Poll with failed deletion')).toBeInTheDocument(); // Poll should still be there
  });

  // Negative Outcome: Error message display
  it('displays an error message when the error prop is provided', async () => {
    const errorMessage = 'Failed to load polls.';
    render(<PollsClient initialPolls={[]} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try Again/i })).toBeInTheDocument();
  });
});
