'use server';


import { redirect } from 'next/navigation';
import { SupabaseClient } from '@supabase/supabase-js';

import { cookies } from 'next/headers';
import { createServerSideClient } from '../supabase';
import {
  createPoll,
  getPollWithOptions,
  getPollWithOptionsAndResults,
  voteOnPoll,
  getUserPolls,
  getPublicPolls,
  deletePoll,
} from '../db';
import { CreatePollInput, PollWithOptionsAndResults, VoteInput } from '../types';



/**
 * Create a new poll with options
 */
export async function createPollAction(formData: FormData) {
  const supabase = createServerSideClient();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
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
  
  console.log("Now creating the poll");
  
  // Create the poll
  const pollInput: CreatePollInput = {
    title,
    description: description || undefined,
    options,
    is_public: true, // Default to public
    allow_multiple_votes: false, // Default to single vote
  };
  
  const poll = await createPoll(pollInput, session.user.id, supabase);
  
  if (!poll) {
    return { error: 'Failed to create poll' };
  }
  
  // Redirect to the new poll
  // redirect(`/polls/${poll.id}`);
  redirect(`/polls/`);
}

/**
 * Vote on a poll
 */
export async function voteOnPollAction(formData: FormData) {
  const supabase = createServerSideClient();
  
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // Extract form data
  const pollId = formData.get('poll_id') as string;
  const optionId = formData.get('option_id') as string;
  
  // Validate input
  if (!pollId || !optionId) {
    return { error: 'Poll ID and Option ID are required' };
  }
  
  // Get IP address from cookies or headers
  const ipCookie = cookies().get('visitor_ip');
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
    supabase
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
export async function getPollAction(pollId: string): Promise<{ poll: PollWithOptionsAndResults | null; error?: string }> {
  if (!pollId) {
    return { poll: null, error: 'Poll ID is required' };
  }
  const supabase = createServerSideClient();
  
  const poll = await getPollWithOptionsAndResults(pollId, supabase);
  
  if (!poll) {
    return { poll: null, error: 'Poll not found' };
  }
  
  return { poll };
}

/**
 * Delete a poll
 */
export async function deletePollAction(formData: FormData) {
  const supabase = createServerSideClient();

  const pollId = formData.get('poll_id') as string;

  if (!pollId) {
    return { error: 'Poll ID is required' };
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { error: 'You must be logged in to delete a poll' };
  }

  const success = await deletePoll(supabase, pollId, session.user.id);

  if (!success) {
    return { error: 'Failed to delete poll' };
  }

  return { success: true };
}