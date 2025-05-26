import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  name: string;
  email: string;
  user_type: 'patient' | 'psychologist' | 'admin';
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: { name: string; user_type: string; crp?: string }) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  cleanupAuthState: () => void;
  getDashboardRoute: (userType?: string) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const getDashboardRoute = (userType?: string) => {
    const type = userType || profile?.user_type;
    switch (type) {
      case 'patient':
        return '/patient-dashboard';
      case 'psychologist':
        return '/psychologist-dashboard';
      case 'admin':
        return '/admin-dashboard';
      default:
        return '/';
    }
  };

  const cleanupAuthState = () => {
    console.log('Cleaning up auth state');
    // Remove standard auth tokens
    localStorage.removeItem('supabase.auth.token');
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  };

  const fetchProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      
      // First try to get the profile using the standard query
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid throwing on no results

      if (error) {
        console.error('Error fetching profile with maybeSingle:', error);
        
        // Fallback to get without single if the first approach fails
        const response = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId);
          
        if (response.error) {
          console.error('Error in fallback profile fetch:', response.error);
          return null;
        }
        
        // Check if we got any data
        if (response.data && response.data.length > 0) {
          data = response.data[0];
        } else {
          console.log('No profile found for user:', userId);
          return null;
        }
      }
      
      if (!data) {
        console.log('No profile data found for user:', userId);
        return null;
      }

      // Type assertion to ensure proper typing
      const typedProfile: Profile = {
        id: data.id,
        name: data.name,
        email: data.email,
        user_type: data.user_type as 'patient' | 'psychologist' | 'admin',
        avatar_url: data.avatar_url
      };

      console.log('Profile fetched successfully:', typedProfile);
      return typedProfile;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to prevent deadlocks
          setTimeout(async () => {
            let profileData = await fetchProfile(session.user.id);
            
            // If no profile exists, try to create one from user metadata
            if (!profileData && session.user) {
              console.log('No profile found, creating from user metadata');
              const userData = session.user.user_metadata;
              
              if (userData && userData.name && userData.user_type) {
                try {
                  const newProfileData = {
                    id: session.user.id,
                    name: userData.name,
                    email: session.user.email || '',
                    user_type: userData.user_type as 'patient' | 'psychologist' | 'admin',
                  };
                  
                  console.log('Creating profile with data:', newProfileData);
                  const { error } = await supabase
                    .from('profiles')
                    .upsert(newProfileData);
                    
                  if (error) {
                    console.error('Error creating profile during auth:', error);
                  } else {
                    // Fetch the newly created profile
                    profileData = await fetchProfile(session.user.id);
                  }
                } catch (err) {
                  console.error('Failed to create profile from metadata:', err);
                }
              } else {
                console.log('Insufficient user metadata to create profile:', userData);
              }
            }
            
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id).then(async (profileData) => {
          // If no profile exists, try to create one from user metadata
          if (!profileData && session.user) {
            console.log('No profile found during initial session, creating from user metadata');
            const userData = session.user.user_metadata;
            
            if (userData && userData.name && userData.user_type) {
              try {
                const newProfileData = {
                  id: session.user.id,
                  name: userData.name,
                  email: session.user.email || '',
                  user_type: userData.user_type as 'patient' | 'psychologist' | 'admin',
                };
                
                console.log('Creating profile with data:', newProfileData);
                const { error } = await supabase
                  .from('profiles')
                  .upsert(newProfileData);
                  
                if (error) {
                  console.error('Error creating profile during initial session:', error);
                } else {
                  // Fetch the newly created profile
                  profileData = await fetchProfile(session.user.id);
                }
              } catch (err) {
                console.error('Failed to create profile from metadata during initial session:', err);
              }
            } else {
              console.log('Insufficient user metadata to create profile during initial session:', userData);
            }
          }
          
          setProfile(profileData);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData: { name: string; user_type: string; crp?: string }) => {
    try {
      setLoading(true);
      
      // Clean up any existing auth state first
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing with signup');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            user_type: userData.user_type,
            // Only include crp in user metadata, not in profile table
            crp: userData.crp,
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        // Create or update profile
        const profileData: any = {
          id: data.user.id,
          name: userData.name,
          email: email,
          user_type: userData.user_type,
        };

        // Don't add CRP to profile if it's not in the schema
        // We already stored it in the user metadata above

        console.log('Creating profile with data:', profileData);
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert(profileData);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          throw profileError; // Re-throw to handle in catch block
        }

        toast({
          title: "Conta criada com sucesso!",
          description: "Você pode fazer login agora.",
        });
      }
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      
      // Clean up existing state
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed, continuing with signin');
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta!",
        });
        
        // Redirect to dashboard route which will handle user type routing
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Sign in error:', error);
      toast({
        title: "Erro ao fazer login",
        description: error.message || "Email ou senha incorretos.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state first
      cleanupAuthState();
      
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;
      
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      
      toast({
        title: "Logout realizado com sucesso",
        description: "Até logo!",
      });
      
      // Force page reload for clean state
      window.location.href = '/login';
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast({
        title: "Erro ao fazer logout",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram salvas com sucesso.",
      });
    } catch (error: any) {
      console.error('Update profile error:', error);
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Ocorreu um erro inesperado.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    cleanupAuthState,
    getDashboardRoute,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
