import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();

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
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Poll fetch error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }

    if (!poll) {
      return NextResponse.json(
        { error: 'Poll not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(poll);

  } catch (error) {
    console.error('Poll API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
