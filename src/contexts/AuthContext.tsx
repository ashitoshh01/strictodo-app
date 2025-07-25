
import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  due_coins: number;
  welcome_bonus_claimed: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  claimWelcomeBonus: () => Promise<void>;
  checkOverdueTasks: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const overdueTasksChecked = useRef(false);

  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
    }
  }, []);

  const checkOverdueTasks = useCallback(async () => {
    if (!user || overdueTasksChecked.current) return;

    try {
      console.log('Checking for overdue tasks...');
      overdueTasksChecked.current = true;
      
      // Get all pending tasks that are overdue
      const { data: overdueTasks, error: fetchError } = await supabase
        .from('tasks')
        .select('id, title, due_date')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .lt('due_date', new Date().toISOString());

      if (fetchError) {
        console.error('Error fetching overdue tasks:', fetchError);
        return;
      }

      if (overdueTasks && overdueTasks.length > 0) {
        console.log(`Found ${overdueTasks.length} overdue tasks, marking as failed...`);
        
        // Mark overdue tasks as failed
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ status: 'failed', updated_at: new Date().toISOString() })
          .in('id', overdueTasks.map(task => task.id));

        if (updateError) {
          console.error('Error updating overdue tasks:', updateError);
        } else {
          toast({
            title: "Tasks updated",
            description: `${overdueTasks.length} overdue task(s) have been marked as failed.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error in checkOverdueTasks:', error);
    }
  }, [user, toast]);

  const claimWelcomeBonus = useCallback(async () => {
    if (!user || !userProfile || userProfile.welcome_bonus_claimed) return;

    try {
      // Call the Supabase function to claim the bonus
      const { error } = await supabase.rpc('claim_welcome_bonus', {
        user_id: user.id
      });

      if (error) throw error;

      // Refresh user profile
      await fetchUserProfile(user.id);
      
      toast({
        title: "Welcome bonus claimed!",
        description: "You received 100 free credits to start your productivity journey!",
      });
    } catch (error: any) {
      console.error('Error claiming welcome bonus:', error);
      toast({
        title: "Error claiming bonus",
        description: error.message || "Failed to claim welcome bonus",
        variant: "destructive"
      });
    }
  }, [user, userProfile, fetchUserProfile, toast]);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Reset the overdue tasks check flag for new sessions
          overdueTasksChecked.current = false;
          // Fetch user profile when user is authenticated
          fetchUserProfile(session.user.id);
        } else {
          setUserProfile(null);
          overdueTasksChecked.current = false;
        }
        
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        overdueTasksChecked.current = false;
        fetchUserProfile(session.user.id);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // Check for overdue tasks only once when both user and userProfile are available
  useEffect(() => {
    if (user && userProfile && !overdueTasksChecked.current) {
      checkOverdueTasks();
    }
  }, [user, userProfile, checkOverdueTasks]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
          }
        }
      });

      if (error) {
        toast({
          title: "Sign up failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Check your email",
          description: "We sent you a confirmation link. Please check your email to verify your account.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign up failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Sign in failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        }
      });

      if (error) {
        toast({
          title: "Google sign in failed",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      toast({
        title: "Google sign in failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      overdueTasksChecked.current = false;
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed out",
          description: "You have been successfully signed out.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userProfile,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      claimWelcomeBonus,
      checkOverdueTasks,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
