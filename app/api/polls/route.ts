import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: 'You must be logged in to create a poll' }, { status: 401 });
  }

  const { question, options } = await request.json();

  if (!question || question.trim().length < 5) {
    return NextResponse.json({ message: 'Question must be at least 5 characters long' }, { status: 400 });
  }

  if (question.trim().length > 500) {
    return NextResponse.json({ message: 'Question must not exceed 500 characters' }, { status: 400 });
  }

  if (!options || options.length < 2) {
    return NextResponse.json({ message: 'At least 2 options are required' }, { status: 400 });
  }

  if (options.length > 10) {
    return NextResponse.json({ message: 'Maximum 10 options are allowed' }, { status: 400 });
  }

  const validOptions = options.filter((option: string) => option.trim().length > 0);

  if (validOptions.length < 2) {
    return NextResponse.json({ message: 'At least 2 valid options are required' }, { status: 400 });
  }

  try {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert({
        question: question.trim(),
        created_by: user.id,
      })
      .select()
      .single();

    if (pollError) {
      return NextResponse.json({ message: `Failed to create poll: ${pollError.message}` }, { status: 500 });
    }

    const optionsToInsert = validOptions.map((option: string) => ({
      poll_id: poll.id,
      text: option.trim(),
    }));

    const { error: optionsError } = await supabase
      .from('poll_options')
      .insert(optionsToInsert);

    if (optionsError) {
      await supabase.from('polls').delete().eq('id', poll.id);
      return NextResponse.json({ message: `Failed to create poll options: ${optionsError.message}` }, { status: 500 });
    }

    revalidatePath('/polls');
    return NextResponse.json({ success: true, message: 'Poll created successfully!', pollId: poll.id }, { status: 201 });
  } catch (error: any) {
    console.error('Poll creation error:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function GET() {
  const supabase = await createSupabaseServerClient();

  try {
    const { data: polls, error } = await supabase
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
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ message: `Failed to fetch polls: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(polls || [], { status: 200 });
  } catch (error: any) {
    console.error('Error fetching polls:', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}