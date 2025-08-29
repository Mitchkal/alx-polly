import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase';
import { voteOnPoll } from '@/lib/db';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const formData = await request.formData();
    const optionId = formData.get('option_id') as string;
    const pollId = params.id;
    
    // Validate input
    if (!pollId || !optionId) {
      return NextResponse.json(
        { error: 'Poll ID and Option ID are required' },
        { status: 400 }
      );
    }
    
    // Get user session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    // Get IP address from request
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1';
    
    // Store IP in cookie for future reference
    const cookieStore = cookies();
    cookieStore.set('visitor_ip', ipAddress, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Submit vote
    const success = await voteOnPoll(
      { poll_id: pollId, option_id: optionId },
      session?.user.id || null,
      ipAddress
    );
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      );
    }
    
    // Redirect to results page
    return NextResponse.redirect(new URL(`/polls/${pollId}/results`, request.url));
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}