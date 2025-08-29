'use server';

import { cookies } from 'next/headers';
import { createClient } from '../supabase';
import {
  createPoll,
  deletePoll,
  getPollWithOptionsAndResults,
  voteOnPoll,
} from '../db';
import {
  CreatePollInput,
  PollWithOptionsAndResults,
  VoteInput,
} from '../types';
import { redirect } from 'next/navigation';

/**
 * Create a new poll
 */
export async function createPollAction(formData: FormData) {
  const supabase = await createClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'You must be logged in to create a poll' };
  }

  // Extract form data
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;

  // Get options (assuming they're named option-1, option-2, etc.)
  const options: string[] = [];
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('option-') && value) {
      options.push(value as string);
    }
  }

  // Validate input
  if (!title) {
    return { error: 'Title is required' };
  }

  if (options.length < 2) {
    return { error: 'At least two options are required' };
  }
  console.log('Now creating the poll');

  // Create the poll
  const pollInput: CreatePollInput = {
    title,
    description: description || undefined,
    options,
    is_public: true, // Default to public
    allow_multiple_votes: false, // Default to single vote
  };

  const poll = await createPoll(pollInput, session.user.id);

  if (!poll) {
    return { error: 'Failed to create poll' };
  }

  // Redirect to the new poll
  // redirect(`/polls/${poll.id}`);
  redirect('/polls');
}

/**
 * Vote on a poll
 */
export async function voteOnPollAction(formData: FormData) {
  const supabase = await createClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Extract form data
  const pollId = formData.get('poll_id') as string;
  const optionId = formData.get('option_id') as string;

  // Validate input
  if (!pollId || !optionId) {
    return { error: 'Poll ID and Option ID are required' };
  }

  // Get IP address from cookies or headers
  const cookieStore = cookies();
  const ipCookie = cookieStore.get('visitor_ip');
  const ipAddress = ipCookie?.value || null;

  // Vote on the poll
  const voteInput: VoteInput = {
    poll_id: pollId,
    option_id: optionId,
  };

  const success = await voteOnPoll(
    voteInput,
    session?.user.id || null,
    ipAddress,
  );

  if (!success) {
    return { error: 'Failed to submit vote' };
  }

  // Redirect to the poll results
  redirect(`/polls/${pollId}/results`);
}

/**
 * Get poll with options and results
 */
export async function getPollAction(
  pollId: string,
): Promise<{ poll: PollWithOptionsAndResults | null; error?: string }> {
  if (!pollId) {
    return { poll: null, error: 'Poll ID is required' };
  }

  const poll = await getPollWithOptionsAndResults(pollId);

  if (!poll) {
    return { poll: null, error: 'Poll not found' };
  }

  return { poll };
}

/**
 * Delete a poll
 */
export async function deletePollAction(formData: FormData) {
  const supabase = await createClient();

  // Get the current session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'You must be logged in to delete a poll' };
  }

  // Extract form data
  const pollId = formData.get('poll_id') as string;

  // Validate input
  if (!pollId) {
    return { error: 'Poll ID is required' };
  }

  // Delete the poll
  const success = await deletePoll(pollId, session.user.id);

  if (!success) {
    return { error: 'Failed to delete poll' };
  }

  // Redirect to the user's polls
  redirect('/profile');
}
