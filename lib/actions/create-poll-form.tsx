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

export function CreatePollForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
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
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      // Add options to form data as option-1, option-2, ...
      options.forEach((option, index) => {
        formData.append(`option-${index + 1}`, option);
      });
      // Call the Server Action
      const result = await createPollAction(formData);
      if (result?.error) {
        setError(result.error);
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        // If no error, Next.js will redirect automatically via the Server Action
        toast({
          title: 'Success!',
          description: 'Your poll has been created.',
        });
      }
    } catch (err) {
      // Handle Next.js redirect error
      if (
        err &&
        typeof err === 'object' &&
        'digest' in err &&
        err.digest === 'NEXT_REDIRECT'
      ) {
        // Show success toast before redirect
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
