import { createPollAction, voteOnPollAction, getPollAction, deletePollAction } from './poll-actions';
import { createServerSideClient } from '../supabase';
import { createPoll, voteOnPoll, getPollWithOptionsAndResults, deletePoll } from '../db';
import { cookies } from 'next/headers';
import { SupabaseClient } from '@supabase/supabase-js';

// Mock dependencies
jest.mock('../supabase', () => ({
  createServerSideClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })),
    },
  })),
}));

jest.mock('../db', () => ({
  createPoll: jest.fn(),
  voteOnPoll: jest.fn(),
  getPollWithOptionsAndResults: jest.fn(),
  deletePoll: jest.fn(),
}));

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  })),
}));

describe('Poll Actions', () => {
  let mockSupabase: SupabaseClient;
  let mockCookies: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = { auth: { getSession: jest.fn(() => Promise.resolve({ data: { session: { user: { id: 'test-user-id' } } }, error: null })) } } as unknown as SupabaseClient;
    (createServerSideClient as jest.Mock).mockReturnValue(mockSupabase);
    
    mockCookies = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
    };
    (cookies as jest.Mock).mockReturnValue(mockCookies);


  });

  describe('createPollAction', () => {
    it('should create a poll successfully', async () => {
      const formData = new FormData();
      formData.append('question', 'Test Question');
      formData.append('options', 'Option A,Option B');

      (createPoll as jest.Mock).mockResolvedValue({ id: 'new-poll-id' });

      const result = await createPollAction(formData);

      expect(createServerSideClient).not.toHaveBeenCalled();
      expect(createPoll).toHaveBeenCalledWith(
        { question: 'Test Question', options: ['Option A', 'Option B'] },
        'test-user-id',
        mockSupabase
      );
      expect(result).toEqual({ pollId: 'new-poll-id' });
    });

    it('should return an error if poll creation fails', async () => {
      const formData = new FormData();
      formData.append('question', 'Test Question');
      formData.append('options', 'Option A,Option B');

      (createPoll as jest.Mock).mockResolvedValue(null);

      const result = await createPollAction(formData);

      expect(createServerSideClient).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'Failed to create poll' });
    });

    it('should return an error if session is not found', async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null }, error: null });

      const formData = new FormData();
      formData.append('question', 'Test Question');
      formData.append('options', 'Option A,Option B');

      const result = await createPollAction(formData);

      expect(createServerSideClient).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'You must be logged in to create a poll' });
    });
  });

  describe('voteOnPollAction', () => {
    it('should successfully submit a vote', async () => {
      const formData = new FormData();
      formData.append('poll_id', 'test-poll-id');
      formData.append('option_id', 'test-option-id');

      (voteOnPoll as jest.Mock).mockResolvedValue(true);

      const result = await voteOnPollAction(formData);

      expect(createServerSideClient).not.toHaveBeenCalled();
      expect(voteOnPoll).toHaveBeenCalledWith(
        { poll_id: 'test-poll-id', option_id: 'test-option-id' },
        'test-user-id',
        expect.any(String),
        mockSupabase
      );
      expect(result).toEqual({ success: true });
    });

    it('should return an error if vote submission fails', async () => {
      const formData = new FormData();
      formData.append('poll_id', 'test-poll-id');
      formData.append('optionId', 'test-option-id');

      (voteOnPoll as jest.Mock).mockResolvedValue(false);

      const result = await voteOnPollAction(formData);

      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(result).toEqual({ error: 'Failed to submit vote' });
    });

    it('should handle anonymous votes', async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null }, error: null });

      const formData = new FormData();
      formData.append('poll_id', 'test-poll-id');
      formData.append('optionId', 'test-option-id');

      (voteOnPoll as jest.Mock).mockResolvedValue(true);

      const result = await voteOnPollAction(formData);

      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(voteOnPoll).toHaveBeenCalledWith(
        { poll_id: 'test-poll-id', option_id: 'test-option-id' },
        null,
        expect.any(String), // ipAddress
        mockSupabase
      );
      expect(result).toEqual({ success: true });
    });
  });

  describe('getPollAction', () => {
    it('should return a poll successfully', async () => {
      const mockPoll = { id: 'test-poll-id', question: 'Test Question', options: [] };
      (getPollWithOptionsAndResults as jest.Mock).mockResolvedValue(mockPoll);

      const result = await getPollAction('test-poll-id');

      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(getPollWithOptionsAndResults).toHaveBeenCalledWith('test-poll-id', mockSupabase);
      expect(result).toEqual({ poll: mockPoll });
    });

    it('should return an error if poll ID is missing', async () => {
      const result = await getPollAction('');

      expect(result).toEqual({ poll: null, error: 'Poll ID is required' });
      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
    });

    it('should return an error if poll not found', async () => {
      (getPollWithOptionsAndResults as jest.Mock).mockResolvedValue(null);

      const result = await getPollAction('non-existent-poll-id');

      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(result).toEqual({ poll: null, error: 'Poll not found' });
    });
  });

  describe('deletePollAction', () => {
    it('should delete a poll successfully', async () => {
      const formData = new FormData();
      formData.append('poll_id', 'test-poll-id');

      (deletePoll as jest.Mock).mockResolvedValue(true);

      const result = await deletePollAction(formData);

      // createServerSideClient and deletePoll are called after pollId validation
      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(deletePoll).toHaveBeenCalledWith(mockSupabase, 'test-poll-id', 'test-user-id');
      expect(result).toEqual({ success: true });
    });

    it('should return an error if poll deletion fails', async () => {
      const formData = new FormData();
      formData.append('poll_id', 'test-poll-id');

      (deletePoll as jest.Mock).mockResolvedValue(false);

      const result = await deletePollAction(formData);

      // createServerSideClient is called after pollId validation
      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(deletePoll).toHaveBeenCalledWith(mockSupabase, 'test-poll-id', 'test-user-id');
      expect(result).toEqual({ error: 'Failed to delete poll' });
    });

    it('should return an error if pollId is missing', async () => {
      const formData = new FormData();

      const result = await deletePollAction(formData);

      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(deletePoll).not.toHaveBeenCalled();
      expect(result).toEqual({ error: 'You must be logged in to delete a poll' });
    });

    it('should return an error if unauthorized', async () => {
      (mockSupabase.auth.getSession as jest.Mock).mockResolvedValueOnce({ data: { session: null }, error: null });

      const formData = new FormData();
      formData.append('poll_id', 'test-poll-id');

      const result = await deletePollAction(formData);

      // createServerSideClient is called after pollId validation
      expect(createServerSideClient).toHaveBeenCalledWith(mockCookies);
      expect(result).toEqual({ error: 'Poll ID is required' });
    });
  });
});