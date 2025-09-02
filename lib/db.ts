import { createServerSideClient } from './supabase';
import { SupabaseClient } from '@supabase/supabase-js';
import { CreatePollInput, Poll, PollOption, PollResult, PollWithOptions, PollWithOptionsAndResults, Vote, VoteInput } from './types';
import { cookies } from 'next/headers';

// Remove the global initialization of cookieStore and supabase client
// const cookieStore = cookies();
// const supabase = createServerSideClient(cookieStore);

/**
 * Create a new poll with options
 */
export async function createPoll(
  input: CreatePollInput,
  userId: string,
  supabase: SupabaseClient // Accept supabase client as a parameter
): Promise<Poll | null> {
  // Start a transaction
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .insert({
      title: input.title,
      description: input.description || null,
      user_id: userId,
      is_public: input.is_public !== undefined ? input.is_public : true,
      allow_multiple_votes: input.allow_multiple_votes !== undefined ? input.allow_multiple_votes : false,
      expires_at: input.expires_at || null,
    })
    .select()
    .single();

  if (pollError || !poll) {
    console.error('Error creating poll:', pollError);
    return null;
  }

  // Add options
  const optionsToInsert = input.options.map(text => ({
    poll_id: poll.id,
    text,
  }));

  const { error: optionsError } = await supabase
    .from('poll_options')
    .insert(optionsToInsert);

  if (optionsError) {
    console.error('Error adding poll options:', optionsError);
    // Clean up the poll if options failed
    await supabase.from('polls').delete().eq('id', poll.id);
    return null;
  }
  console.log("poll created:", poll);
  return poll;
}

/**
 * Get a poll by ID with its options
 */
export async function getPollWithOptions(
  pollId: string,
  supabase: SupabaseClient // Accept supabase client as a parameter
): Promise<PollWithOptions | null> {
  // Get the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('*')
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    console.error('Error fetching poll:', pollError);
    return null;
  }

  // Get the poll options
  const { data: options, error: optionsError } = await supabase
    .from('poll_options')
    .select('*')
    .eq('poll_id', pollId);

  if (optionsError) {
    console.error('Error fetching poll options:', optionsError);
    return null;
  }

  return {
    ...poll,
    options: options || [],
  };
}

/**
 * Get a poll with options and results
 */
export async function getPollWithOptionsAndResults(
  pollId: string,
  supabase: SupabaseClient // Accept supabase client as a parameter
): Promise<PollWithOptionsAndResults | null> {
  const pollWithOptions = await getPollWithOptions(pollId, supabase); // Pass supabase client
  
  if (!pollWithOptions) {
    return null;
  }

  // Get the poll results
  const { data: results, error: resultsError } = await supabase
    .from('poll_results')
    .select('*')
    .eq('poll_id', pollId);

  if (resultsError) {
    console.error('Error fetching poll results:', resultsError);
    return null;
  }

  return {
    ...pollWithOptions,
    results: results || [],
  };
}

/**
 * Vote on a poll
 */
export async function voteOnPoll(
  input: VoteInput,
  userId: string | null,
  ipAddress: string | null,
  supabase: SupabaseClient // Accept supabase client as a parameter
): Promise<boolean> {
  // Check if the poll exists
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('id, allow_multiple_votes')
    .eq('id', input.poll_id)
    .single();

  if (pollError || !poll) {
    console.error('Error fetching poll for voting:', pollError);
    return false;
  }

  // If user is authenticated and poll doesn't allow multiple votes, check if they've already voted
  if (userId && !poll.allow_multiple_votes) {
    const { data: existingVote, error: voteCheckError } = await supabase
      .rpc('has_user_voted', { poll_uuid: input.poll_id, user_uuid: userId });

    if (voteCheckError) {
      console.error('Error checking if user has voted:', voteCheckError);
      return false;
    }

    if (existingVote) {
      console.error('User has already voted on this poll');
      return false;
    }
  }

  // Insert the vote
  const { error: voteError } = await supabase
    .from('votes')
    .insert({
      poll_id: input.poll_id,
      option_id: input.option_id,
      user_id: userId,
      ip_address: ipAddress,
    });

  if (voteError) {
    console.error('Error submitting vote:', voteError);
    return false;
  }

  return true;
}

/**
 * Get all polls for a user
 */
export async function getUserPolls(userId: string, supabase: SupabaseClient): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user polls:', error);
    return [];
  }

  return data || [];
}

/**
 * Get public polls
 */
export async function getPublicPolls(supabase: SupabaseClient, limit = 10, offset = 0): Promise<Poll[]> {
  const { data, error } = await supabase
    .from('polls')
    .select('*')
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching public polls:', error);
    return [];
  }

  return data || [];
}

/**
 * Delete a poll
 */
export async function deletePoll(supabase: SupabaseClient, pollId: string, userId: string): Promise<boolean> {
  // Check if the user owns the poll
  const { data: poll, error: pollError } = await supabase
    .from('polls')
    .select('user_id')
    .eq('id', pollId)
    .single();

  if (pollError || !poll) {
    console.error('Error fetching poll for deletion:', pollError);
    return false;
  }

  if (poll.user_id !== userId) {
    console.error('User does not own this poll');
    return false;
  }

  // Delete the poll (cascade will handle options and votes)
  const { error: deleteError } = await supabase
    .from('polls')
    .delete()
    .eq('id', pollId);

  if (deleteError) {
    console.error('Error deleting poll:', deleteError);
    return false;
  }

  return true;
}