
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Password reset error:', error);
        
        // Handle specific error cases
        if (error.message.includes('rate limit')) {
          toast({
            title: "Too many requests",
            description: "Please wait a few minutes before requesting another reset link.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error sending reset email",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        setIsEmailSent(true);
        toast({
          title: "Password reset email sent",
          description: "Check your email for the reset link. If you don't see it, check your spam folder.",
        });
        console.log('Password reset email sent successfully to:', email);
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred while sending the reset email",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 flex items-center justify-center p-4">
      {/* Back Arrow */}
      <Link 
        to="/signin" 
        className="absolute top-6 left-6 flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Back to Sign In</span>
      </Link>

      <Card className="w-full max-w-md mx-auto shadow-xl">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl font-bold text-center">
            {isEmailSent ? "Check Your Email" : "Reset Password"}
          </CardTitle>
          <CardDescription className="text-center">
            {isEmailSent 
              ? "We've sent a password reset link to your email address."
              : "Enter your email address and we'll send you a link to reset your password."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEmailSent ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <p className="text-sm text-muted-foreground">
                If an account with <strong>{email}</strong> exists, you'll receive a password reset link shortly.
              </p>
              <p className="text-xs text-muted-foreground">
                Don't see the email? Check your spam folder or try again with a different email address.
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => {
                    setIsEmailSent(false);
                    setEmail('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Send Another Email
                </Button>
                <Link to="/signin">
                  <Button variant="ghost" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                disabled={isLoading || !email}
              >
                {isLoading ? "Sending Reset Link..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Remember your password? </span>
            <Link to="/signin" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
