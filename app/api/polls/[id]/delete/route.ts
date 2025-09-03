import { NextRequest, NextResponse } from 'next/server';
import { createClientBrowser } from '@/lib/supabase-browser';
import { deletePoll } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const pollId = params.id;
    
    // Validate input
    if (!pollId) {
      return NextResponse.json(
        { error: 'Poll ID is required' },
        { status: 400 }
      );
    }
    
    // Get user session
    const supabase = createClientBrowser();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Delete poll
    const success = await deletePoll(supabase, pollId, session.user.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete poll or poll not found' },
        { status: 404 }
      );
    }
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  } catch (error) {
    console.error('Error deleting poll:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}