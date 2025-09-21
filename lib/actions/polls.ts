'use server';

/**
 * Server actions for poll management operations
 * Handles creating, reading, updating, and deleting polls
 */

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Creates a new poll with options
 *
 * @param formData - Form data containing question and options
 * @returns Promise<{ success: boolean; message?: string; pollId?: string }>
 *          Returns success status with poll ID on creation or error message
 */
export async function createPoll(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be logged in to create a poll');
  }

  const question = formData.get('question') as string;
  const options = formData.getAll('options') as string[];

  if (!question || question.trim().length < 5) {
    throw new Error('Question must be at least 5 characters long');
  }

  if (question.trim().length > 500) {
    throw new Error('Question must not exceed 500 characters');
  }

  if (!options || options.length < 2) {
    throw new Error('At least 2 options are required');
  }

  if (options.length > 10) {
    throw new Error('Maximum 10 options are allowed');
  }

  // Filter out empty options
  const validOptions = options.filter(option => option.trim().length > 0);

  if (validOptions.length < 2) {
    throw new Error('At least 2 valid options are required');
  }

  try {
    // Use Supabase transaction or implement proper cleanup
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        created_by: user.id,
      })
      .select()
      .single();

    if (pollError) {
      throw new Error(`Failed to create poll: ${pollError.message}`);
    }

    // Then create the options
    const optionsToInsert = validOptions.map(option => ({
      poll_id: poll.id,
      text: option.trim(),
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert);

    if (optionsError) {
      // Clean up the created poll to maintain data integrity
      await supabase
        .from('polls')
        .delete()
        .eq('id', poll.id);
      throw new Error(`Failed to create poll options: ${optionsError.message}`);
    }

    revalidatePath('/polls');
    return {
      success: true,
      message: 'Poll created successfully!',
      pollId: poll.id,
    };
  } catch (error) {
    console.error('Poll creation error:', error);
    throw error;
  }
}

export async function getPolls() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: polls, error } = await supabase
  .from("polls")
  .select(`
    id,
    question,
    created_at,
    created_by,
    total_votes,
    poll_options:poll_options!poll_options_poll_id_fkey (
      id,
      text,
      votes_count
    )
  `).order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch polls: ${error.message}`);
    }

    return polls || [];
  } catch (error) {
    console.error('Error fetching polls:', error);
    throw error;
  }
}

export async function getPollById(pollId: string) {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: poll, error } = await supabase
      .from('polls')
      .select(`
        id,
        question,
        created_at,
        total_votes,
        created_by,
        poll_options:poll_options!poll_options_poll_id_fkey (
          id,
          text,
          votes_count
        )
      `)
      .eq('id', pollId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch poll: ${error.message}`);
    }

    return poll;
  } catch (error) {
    console.error('Error fetching poll:', error);
    throw error;
  }
}

export async function deletePoll(pollId: string) {
  const supabase = await createSupabaseServerClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be logged in to delete a poll');
  }

  try {
    // Check if user owns the poll
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', pollId)
      .single();

    if (pollError) {
      throw new Error(`Failed to find poll: ${pollError.message}`);
    }

    if (poll.created_by !== user.id) {
      throw new Error('You can only delete your own polls');
    }

    // Delete the poll (cascade will handle options and votes)
    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (deleteError) {
      throw new Error(`Failed to delete poll: ${deleteError.message}`);
    }

    revalidatePath('/polls');
    return {
      success: true,
      message: 'Poll deleted successfully!',
    };
  } catch (error) {
    console.error('Poll deletion error:', error);
    throw error;
  }
}

export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createSupabaseServerClient();

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error('You must be logged in to update a poll');
  }

  const question = formData.get('question') as string;
  const options = formData.getAll('options') as string[];

  if (!question || question.trim().length < 5) {
    throw new Error('Question must be at least 5 characters long');
  }

  if (!options || options.length < 2) {
    throw new Error('At least 2 options are required');
  }

  // Filter out empty options
  const validOptions = options.filter(option => option.trim().length > 0);

  if (validOptions.length < 2) {
    throw new Error('At least 2 valid options are required');
  }

  try {
    // Check if user owns the poll and get current options with vote counts
    const { data: existingPoll, error: pollError } = await supabase
      .from('polls')
      .select(`
        created_by,
        total_votes,
        poll_options (
          id,
          text,
          votes_count
        )
      `)
      .eq('id', pollId)
      .single();

    if (pollError) {
      throw new Error(`Failed to find poll: ${pollError.message}`);
    }

    if (existingPoll.created_by !== user.id) {
      throw new Error('You can only update your own polls');
    }

    // Check if poll has any votes - if so, prevent option modifications
    const hasVotes = existingPoll.total_votes > 0;
    const existingOptionTexts = existingPoll.poll_options?.map(opt => opt.text.trim()) || [];
    const newOptionTexts = validOptions.map(opt => opt.trim());

    // Check if options have actually changed
    const optionsChanged = existingOptionTexts.length !== newOptionTexts.length ||
      !existingOptionTexts.every(text => newOptionTexts.includes(text)) ||
      !newOptionTexts.every(text => existingOptionTexts.includes(text));

    if (hasVotes && optionsChanged) {
      throw new Error('Cannot modify poll options after voting has started. You can only update the question.');
    }

    // Update the poll question
    const { error: updateError } = await supabase
      .from('polls')
      .update({ question: question.trim() })
      .eq('id', pollId);

    if (updateError) {
      throw new Error(`Failed to update poll: ${updateError.message}`);
    }

    // Only update options if they haven't changed or if poll has no votes
    if (optionsChanged && !hasVotes) {
      // Delete existing options and create new ones (only if no votes exist)
      const { error: deleteOptionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', pollId);

      if (deleteOptionsError) {
        throw new Error(`Failed to update poll options: ${deleteOptionsError.message}`);
      }

      // Insert new options
      const optionsToInsert = validOptions.map(option => ({
        poll_id: pollId,
        text: option.trim(),
      }));

      const { error: insertOptionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

      if (insertOptionsError) {
        throw new Error(`Failed to create new poll options: ${insertOptionsError.message}`);
      }
    }

    revalidatePath('/polls');
    revalidatePath(`/polls/${pollId}`);
    return {
      success: true,
      message: 'Poll updated successfully!',
    };
  } catch (error) {
    console.error('Poll update error:', error);
    throw error;
  }
}
