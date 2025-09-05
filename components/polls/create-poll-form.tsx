'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { PlusCircle, X } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { createPollAction } from '@/lib/actions/poll-actions';
import { toast } from '@/components/ui/use-toast';
// REMOVE THIS LINE: import { redirect } from "next/navigation";

/**
 * CreatePollForm Component
 *
 * This component provides a form for users to create new polls in the Polling App.
 * It handles dynamic option management, form submission via Server Actions, and user feedback.
 *
 * Why: Enables authenticated users to generate polls with multiple options, which are stored in Supabase.
 * This promotes user engagement by allowing content creation and sharing.
 *
 * Assumptions:
 * - User is authenticated via Supabase Auth (handled in parent components or middleware).
 * - Network connection is available for Server Action calls.
 * - Minimum of 2 options required for a valid poll.
 *
 * Edge Cases:
 * - Attempting to remove options below 2 is prevented.
 * - Empty title or options trigger form validation.
 * - Server errors (e.g., duplicate polls, network issues) display toast notifications.
 * - Loading states disable inputs to prevent multiple submissions.
 *
 * Connections:
 * - Uses createPollAction from '@/lib/actions/poll-actions' for backend submission.
 * - Integrates shadcn/ui components (Button, Input, Card, etc.) for consistent UI.
 * - Toast notifications from use-toast for user feedback.
 * - Redirects to poll list or detail page upon success via Next.js navigation.
 */
export function CreatePollForm() {
  // State for loading indicator during submission
  // Why: Prevents multiple submissions and provides user feedback
  const [isLoading, setIsLoading] = useState(false);
  // State for managing poll options dynamically
  // Assumptions: Starts with 2 options; users can add/remove
  // Edge Cases: Enforces minimum 2 options
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
  // State for error messages from submission
  // Why: Displays server-side errors to user
  const [error, setError] = useState<string | null>(null);

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return; // Minimum 2 options
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  async function onSubmit(event: React.FormEvent) {
    // Prevent default form submission
    // Why: Allows custom handling with Server Actions
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      // Extract form data
      // Assumptions: Form fields match expected names
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      // Append options to form data
      // Why: Server Action expects options as form fields
      options.forEach((option, index) => {
        formData.append(`option-${index + 1}`, option);
      });
      // Call Server Action
      // Connections: Integrates with createPollAction for database insertion
      const result = await createPollAction(formData);
      if (result?.error) {
        // Handle errors from action
        // Edge Cases: Validation failures, database errors
        setError(result.error);
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        // Success handling
        // Why: Provides feedback before potential redirect
        toast({
          title: 'Success!',
          description: 'Your poll has been created.',
        });
      }
    } catch (err) {
      // Catch unexpected errors
      // Edge Cases: Network failures, redirect handling
      if (
        err &&
        typeof err === 'object' &&
        'digest' in err &&
        err.digest === 'NEXT_REDIRECT'
      ) {
        toast({
          title: 'Success!',
          description: 'Your poll has been created.',
        });
        throw err;
      } else {
        console.error('Failed to create poll:', err);
        setError('An unexpected error occurred. Please try again.');
        toast({
          title: 'Error',
          description: 'An unexpected error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Poll</CardTitle>
        <CardDescription>
          Fill out the form below to create a new poll
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className='space-y-6'>
          {error && (
            <div className='bg-destructive/15 text-destructive text-sm p-3 rounded-md'>
              {error}
            </div>
          )}

          <div className='space-y-2'>
            <Label htmlFor='title'>Poll Title</Label>
            <Input
              id='title'
              name='title'
              placeholder='Enter your poll question'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description (Optional)</Label>
            <Textarea
              id='description'
              name='description'
              placeholder='Provide additional context for your poll'
              className='resize-none'
            />
          </div>

          <div className='space-y-3'>
            <Label>Poll Options</Label>
            <div className='space-y-3'>
              {options.map((option, index) => (
                <div key={index} className='flex items-center space-x-2'>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={() => removeOption(index)}
                    disabled={options.length <= 2 || isLoading}
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              ))}
            </div>

            <Button
              type='button'
              variant='outline'
              size='sm'
              className='mt-2'
              onClick={addOption}
              disabled={isLoading}
            >
              <PlusCircle className='mr-2 h-4 w-4' />
              Add Option
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button type='submit' className='w-full' disabled={isLoading}>
            {isLoading ? 'Creating poll...' : 'Create Poll'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
