"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

/**
 * RegisterForm Component
 *
 * This component handles user registration by providing a form for name, email, password, and confirmation.
 * Why: Allows new users to create accounts in the Polling App, enabling them to create and vote on polls.
 *      Uses Supabase for secure authentication and user management.
 * Assumptions: Email is unique; passwords match; network available; Supabase configured properly.
 * Edge Cases: Password mismatch, invalid email, existing account, network errors.
 * Connections: Integrates with AuthContext for signUp; uses Next.js router for redirection;
 *              shadcn/ui for UI consistency; toast for feedback.
 */
export function RegisterForm() {
  // State for loading indicator
  // Why: Manages form disabled state during async registration.
  const [isLoading, setIsLoading] = useState(false);

  // Form input states
  // Assumptions: Name is optional but provided; passwords will be checked for match.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Hooks
  // Connections: signUp from AuthContext handles Supabase registration.
  const { signUp } = useAuth();
  const router = useRouter();

  /**
   * Handles form submission for registration.
   * Why: Validates input, calls signUp, handles errors, and redirects on success.
   * Edge Cases: Password mismatch check; Supabase errors like duplicate email.
   */
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    // Check password match
    // Why: Prevents submission of mismatched passwords early.
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const { error, user } = await signUp(email, password, name);
      
      if (error) {
        // Error feedback
        // Why: Informs user of issues like invalid credentials.
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Success handling
        // Why: Notifies user to verify email and redirects.
        // Assumptions: Email verification is handled by Supabase.
        toast({
          title: "Success",
          description: "Account created successfully. Please check your email for verification.",
        });
        router.push("/");
        router.refresh();
      }
    } catch (error: any) {
      // Catch-all for errors
      // Edge Case: Unexpected issues like network failures.
      toast({
        title: "Error",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      // Reset loading
      // Why: Re-enables form always.
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register</CardTitle>
        <CardDescription>
          Create a new account to start creating and voting on polls
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              required
              disabled={isLoading}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              required
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              required
              disabled={isLoading}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Register"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}