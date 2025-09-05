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
 * LoginForm Component
 *
 * This component handles user authentication by providing a form for email and password login.
 * Why: In the Polling App, authentication is crucial for users to create and manage polls securely.
 *      It uses Supabase for backend auth, ensuring only registered users can access protected features.
 * Assumptions: User has a valid Supabase account; network connection is available.
 * Edge Cases: Invalid credentials, network errors, empty fields (handled by required attributes).
 * Connections: Integrates with AuthContext for session management; redirects to home via Next.js router;
 *              Uses shadcn/ui components for consistent UI; toast for user feedback.
 */
export function LoginForm() {
  // State for loading indicator to disable form during async operations
  // Why: Prevents multiple submissions and provides UX feedback.
  const [isLoading, setIsLoading] = useState(false);

  // State for form inputs
  // Assumptions: Email is valid format (enforced by input type); password is secure.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hooks for auth and navigation
  // Connections: useAuth provides signIn function from Supabase context.
  const { signIn } = useAuth();
  const router = useRouter();

  /**
   * Handles form submission for login.
   * Why: Centralizes login logic, including error handling and redirection.
   * Edge Cases: Catches Supabase errors, generic exceptions; handles loading state.
   */
  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        // Display error toast
        // Why: Provides immediate feedback without page reload.
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        // Success handling
        // Why: Notifies user and redirects to main app page.
        // Assumptions: Successful login implies valid session.
        toast({
          title: "Success",
          description: "You have been logged in",
        });
        router.push("/");
        router.refresh(); // Refresh to update any server components with new session
      }
    } catch (error: any) {
      // Generic error catcher
      // Edge Case: Unexpected errors like network issues.
      toast({
        title: "Error",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      // Always reset loading state
      // Why: Ensures form is re-enabled regardless of success/failure.
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your email and password to login to your account
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Forgot password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              required
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Loading..." : "Login"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}