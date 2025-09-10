import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
        poll_options (
          id,
          text,
          votes_count
        )
      `)
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ message: `Failed to fetch poll: ${error.message}` }, { status: 404 });
    }

    return NextResponse.json(poll, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching poll:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'You must be logged in to delete a poll' }, { status: 401 });
  }

  try {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .select('created_by')
      .eq('id', params.id)
      .single();

    if (pollError) {
      return NextResponse.json({ message: `Failed to find poll: ${pollError.message}` }, { status: 404 });
    }

    if (poll.created_by !== user.id) {
      return NextResponse.json({ message: 'You can only delete your own polls' }, { status: 403 });
    }

    const { error: deleteError } = await supabase
      .from('polls')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      return NextResponse.json({ message: `Failed to delete poll: ${deleteError.message}` }, { status: 500 });
    }

    revalidatePath('/polls');
    return NextResponse.json({ success: true, message: 'Poll deleted successfully!' }, { status: 200 });
  } catch (error: any) {
    console.error('Poll deletion error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'You must be logged in to update a poll' }, { status: 401 });
  }

  const { question, options } = await request.json();

  if (!question || question.trim().length < 5) {
    return NextResponse.json({ message: 'Question must be at least 5 characters long' }, { status: 400 });
  }

  if (!options || options.length < 2) {
    return NextResponse.json({ message: 'At least 2 options are required' }, { status: 400 });
  }

  const validOptions = options.filter((option: string) => option.trim().length > 0);

  if (validOptions.length < 2) {
    return NextResponse.json({ message: 'At least 2 valid options are required' }, { status: 400 });
  }

  try {
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
      .eq('id', params.id)
      .single();

    if (pollError) {
      return NextResponse.json({ message: `Failed to find poll: ${pollError.message}` }, { status: 404 });
    }

    if (existingPoll.created_by !== user.id) {
      return NextResponse.json({ message: 'You can only update your own polls' }, { status: 403 });
    }

    const hasVotes = existingPoll.total_votes > 0;
    const existingOptionTexts = existingPoll.poll_options?.map((opt: any) => opt.text.trim()) || [];
    const newOptionTexts = validOptions.map((opt: string) => opt.trim());

    const optionsChanged = existingOptionTexts.length !== newOptionTexts.length ||
      !existingOptionTexts.every((text: string) => newOptionTexts.includes(text)) ||
      !newOptionTexts.every((text: string) => existingOptionTexts.includes(text));

    if (hasVotes && optionsChanged) {
      return NextResponse.json({ message: 'Cannot modify poll options after voting has started. You can only update the question.' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('polls')
      .update({ question: question.trim() })
      .eq('id', params.id);

    if (updateError) {
      return NextResponse.json({ message: `Failed to update poll: ${updateError.message}` }, { status: 500 });
    }

    if (optionsChanged && !hasVotes) {
      const { error: deleteOptionsError } = await supabase
        .from('poll_options')
        .delete()
        .eq('poll_id', params.id);

      if (deleteOptionsError) {
        return NextResponse.json({ message: `Failed to update poll options: ${deleteOptionsError.message}` }, { status: 500 });
      }

      const optionsToInsert = validOptions.map((option: string) => ({
        poll_id: params.id,
        text: option.trim(),
      }));

      const { error: insertOptionsError } = await supabase
        .from('poll_options')
        .insert(optionsToInsert);

      if (insertOptionsError) {
        return NextResponse.json({ message: `Failed to create new poll options: ${insertOptionsError.message}` }, { status: 500 });
      }
    }

    revalidatePath('/polls');
    revalidatePath(`/polls/${params.id}`);
    return NextResponse.json({ success: true, message: 'Poll updated successfully!' }, { status: 200 });
  } catch (error: any) {
    console.error('Poll update error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}