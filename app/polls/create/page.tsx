'use client';

import { useAuth } from '@/contexts/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { redirect, useRouter } from 'next/navigation';
import { useState, startTransition } from 'react';
import { toast } from '@/components/ui/use-toast';
import { createPollAction } from '@/lib/actions/poll-actions';

export default function CreatePollPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [options, setOptions] = useState<string[]>(['Option 1', 'Option 2']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user) {
    redirect('/login');
  }

  const addOption = () => {
    setOptions([...options, `Option ${options.length + 1}`]);
  };

  const removeOption = (index: number) => {
    if (options.length <= 2) return;
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  async function handleAction(formData: FormData) {
    try {
      // Add options to form data with proper validation
      const filteredOptions = options.filter((option) => option.trim() !== '');

      if (filteredOptions.length < 2) {
        toast({
          title: 'Error',
          description: 'Please provide at least 2 non-empty options.',
          variant: 'destructive',
        });
        return;
      }

      // Clear any existing option data and add fresh options

      filteredOptions.forEach((option, index) => {
        formData.append(`option-${index + 1}`, option.trim());
      });

      console.log('Submitting poll with data:', {
        title: formData.get('title'),
        description: formData.get('description'),
        options: filteredOptions,
      });

      const result = await createPollAction(formData);

      console.log('Server action result:', result);

      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Success!',
          description: 'Your poll has been created successfully.',
        });

        // Redirect to the created poll or polls list
        if ('pollId' in result && result.pollId) {
          router.push(`/polls/${result.pollId}`);
        } else {
          router.push('/polls');
        }
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  }
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(() => {
      handleAction(formData);
    });
  };

  return (
    <div className='container max-w-4xl py-10'>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Poll</CardTitle>
          <CardDescription>
            Fill out the form below to create a new poll
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>

          <CardContent className='space-y-6'>
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
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => removeOption(index)}
                      disabled={options.length <= 2 || isSubmitting}
                    >
                      <span className='sr-only'>Remove option</span>
                      <svg
                        className='h-4 w-4'
                        fill='none'
                        stroke='currentColor'
                        strokeWidth='2'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          d='M6 18L18 6M6 6l12 12'
                        />
                      </svg>
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
                disabled={isSubmitting}
              >
                <svg
                  className='mr-2 h-4 w-4'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    d='M12 4v16m8-8H4'
                  />
                </svg>
                Add Option
              </Button>
            </div>
          </CardContent>
          <CardFooter>
            <Button type='submit' className='w-full' disabled={isSubmitting}>
              {isSubmitting ? 'Creating Poll...' : 'Create Poll'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
