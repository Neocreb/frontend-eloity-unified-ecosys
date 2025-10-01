import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type FC,
  type ReactNode,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { ExtendedUser, UserProfile } from "@/types/user";

// Define types for our context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ExtendedUser | null;
  session: Session | null;
  error: Error | null;
  login: (email: string, password: string) => Promise<{ error?: Error }>;
  logout: () => Promise<void>;
  signup: (
    email: string,
    password: string,
    name: string,
    referralCode?: string,
  ) => Promise<{ error?: Error }>;
  isAdmin: () => boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  session: null,
  error: null,
  login: async () => ({ error: undefined }),
  logout: async () => {},
  signup: async () => ({ error: undefined }),
  isAdmin: () => false,
  updateProfile: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Authentication provider component
export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // Define state hooks with safer initialization
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Transform user data to include convenience properties
  const enhanceUserData = useCallback(
    (rawUser: User | null): ExtendedUser | null => {
      if (!rawUser) return null;

      const makeUsername = (): string => {
        const meta = (rawUser as any)?.user_metadata || {};
        const candidate = (meta.username || meta.user_name || "").toString().trim();
        if (candidate && candidate.toLowerCase() !== "unknown") return candidate;
        const emailLocal = (rawUser.email || "").split("@")[0] || "";
        const fromEmail = emailLocal
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "_")
          .replace(/_+/g, "_")
          .replace(/^_+|_+$/g, "");
        if (fromEmail) return fromEmail;
        return `user_${rawUser.id.slice(0, 6)}`;
      };

      try {
        const safeUsername = makeUsername();
        return {
          ...rawUser,
          name:
            rawUser.user_metadata?.name ||
            rawUser.user_metadata?.full_name ||
            "User",
          username: safeUsername,
          avatar:
            rawUser.user_metadata?.avatar ||
            rawUser.user_metadata?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(rawUser.user_metadata?.name || "User")}&background=random`,
          points: rawUser.user_metadata?.points || 0,
          level: rawUser.user_metadata?.level || "bronze",
          role: rawUser.user_metadata?.role || "user",
          profile: {
            id: rawUser.id,
            username: safeUsername,
            full_name:
              rawUser.user_metadata?.name || rawUser.user_metadata?.full_name || safeUsername,
            avatar_url:
              rawUser.user_metadata?.avatar ||
              rawUser.user_metadata?.avatar_url,
            bio: rawUser.user_metadata?.bio,
            points: rawUser.user_metadata?.points || 0,
            level: rawUser.user_metadata?.level || "bronze",
            role: rawUser.user_metadata?.role || "user",
            is_verified: rawUser.user_metadata?.is_verified || false,
            bank_account_name: rawUser.user_metadata?.bank_account_name,
            bank_account_number: rawUser.user_metadata?.bank_account_number,
            bank_name: rawUser.user_metadata?.bank_name,
            // Premium subscription fields
            is_premium: rawUser.user_metadata?.is_premium || false,
            premium_tier: rawUser.user_metadata?.premium_tier || "free",
            subscription_status: rawUser.user_metadata?.subscription_status || "active",
            subscription_expires_at: rawUser.user_metadata?.subscription_expires_at,
            subscription_auto_renew: rawUser.user_metadata?.subscription_auto_renew || false,
            subscription_created_at: rawUser.user_metadata?.subscription_created_at,
            // KYC fields
            kyc_level: rawUser.user_metadata?.kyc_level || 0,
            kyc_verified_at: rawUser.user_metadata?.kyc_verified_at,
          },
        };
      } catch (error) {
        console.warn("Failed to enhance user data:", error);
        const fallbackUsername = `user_${rawUser.id.slice(0, 6)}`;
        return {
          ...rawUser,
          name: "User",
          username: fallbackUsername,
          avatar: `https://ui-avatars.com/api/?name=User&background=random`,
          points: 0,
          level: "bronze",
          role: "user",
          profile: {
            id: rawUser.id,
            username: fallbackUsername,
            full_name: "User",
            avatar_url: undefined,
            bio: undefined,
            points: 0,
            level: "bronze",
            role: "user",
            is_verified: false,
            bank_account_name: undefined,
            bank_account_number: undefined,
            bank_name: undefined,
            // Premium subscription fields
            is_premium: false,
            premium_tier: "free",
            subscription_status: "active",
            subscription_expires_at: undefined,
            subscription_auto_renew: false,
            subscription_created_at: undefined,
            // KYC fields
            kyc_level: 0,
            kyc_verified_at: undefined,
          },
        };
      }
    },
    [],
  );

  // Ensure a profile row exists for the authenticated user
  const ensureProfileExists = useCallback(async (rawUser: User | null | undefined) => {
    try {
      if (!rawUser) return;
      const userId = rawUser.id;
      const { data: existing, error: fetchError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.warn("Profile fetch error:", fetchError.message);
      }
      if (!existing) {
        const username = (rawUser.user_metadata?.username || (rawUser.email || "").split("@")[0] || `user_${userId.slice(0,6)}`).toString();
        const full_name = rawUser.user_metadata?.name || rawUser.user_metadata?.full_name || username;
        const avatar_url = rawUser.user_metadata?.avatar || rawUser.user_metadata?.avatar_url || null;
        const { error: insertError } = await supabase.from("profiles").insert({
          user_id: userId,
          username,
          full_name,
          avatar_url,
          is_verified: false,
          role: "user",
          points: 0,
          level: "bronze",
        });
        if (insertError) {
          console.warn("Profile insert error:", insertError.message);
        } else {
          console.log("Profile created for user", userId);
        }
      }
    } catch (e) {
      console.warn("ensureProfileExists error:", (e as any)?.message || e);
    }
  }, []);

  // Check for an existing session on component mount
  useEffect(() => {
    console.log("AuthProvider: Initializing");
    let mounted = true;

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if environment variables are available
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
          console.error("Supabase environment variables are missing!");
          console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
          console.log("VITE_SUPABASE_PUBLISHABLE_KEY available:", !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);
          setError(new Error("Supabase configuration is missing"));
          setIsLoading(false);
          return;
        }

        console.log("Supabase client initialized with URL:", import.meta.env.VITE_SUPABASE_URL);

        // Get initial session with timeout fallback (never rejects)
        const authInitTimeout =
          Number((import.meta as any).env?.VITE_AUTH_INIT_TIMEOUT_MS) || 8000;

        const sessionResult = (await Promise.race([
          supabase.auth.getSession(),
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: { session: null }, error: null }),
              authInitTimeout
            ),
          ),
        ])) as any;

        const session = sessionResult?.data?.session ?? null;
        const sessionError = sessionResult?.error ?? null;

        // Only update state if component is still mounted
        if (!mounted) return;

        if (sessionError) {
          console.warn("Error getting session:", sessionError);
          // Don't treat auth errors as fatal for public pages
          setError(null);
        }

        setSession(session);
        setUser(enhanceUserData(session?.user || null));
        ensureProfileExists(session?.user || null).catch(() => {});
      } catch (error) {
        console.warn("Auth initialization warning:", error);
        if (mounted) {
          // Don't treat auth initialization errors as fatal
          setError(null);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth state changes
    let subscription: any;
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        console.log("Auth state changed:", event, session?.user?.id);

        // Only update state if component is still mounted
        if (!mounted) return;

        try {
          setSession(session);
          setUser(enhanceUserData(session?.user || null));
          ensureProfileExists(session?.user || null).catch(() => {});
          setError(null);
        } catch (error) {
          console.error("Auth state change error:", error);
          // Don't set error state for auth issues on public pages
          if (mounted) {
            setError(null);
          }
        } finally {
          if (mounted) {
            setIsLoading(false);
          }
        }
      });
      subscription = authSubscription;
    } catch (error) {
      console.error("Error setting up auth listener:", error);
      if (mounted) {
        setIsLoading(false);
      }
    }

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === "function") {
        subscription.unsubscribe();
      }
    };
  }, [enhanceUserData]);

  // Process referral signup if referral code exists
  const processReferralSignup = useCallback(async (newUserId: string, referralCode?: string) => {
    try {
      // Use passed referral code or fall back to localStorage (for backward compatibility)
      let codeToProcess = referralCode;
      let shouldCleanup = false;

      if (!codeToProcess) {
        const storedCode = localStorage.getItem('referralCode');
        codeToProcess = storedCode || undefined;
        const referralExpiry = localStorage.getItem('referralCodeExpiry');

        if (!codeToProcess || !referralExpiry) {
          return; // No referral code to process
        }

        // Check if referral code has expired (30 minutes from tracking)
        if (Date.now() > parseInt(referralExpiry)) {
          localStorage.removeItem('referralCode');
          localStorage.removeItem('referralCodeExpiry');
          console.log('Referral code expired, not processing');
          return;
        }
        shouldCleanup = true;
      }

      if (!codeToProcess) {
        return; // No referral code to process
      }

      // Use the existing backend referral system to process the referral
      // This will find the referrer and give them their rewards through the existing system
      try {
        const { ReferralService } = await import('@/services/referralService');

        const success = await ReferralService.processReferralSignup({
          referralCode: codeToProcess,
          newUserId
        });

        if (success) {
          console.log('Referral signup processed successfully');

          // Also give the new user a welcome bonus using ActivityRewardService
          try {
            const { ActivityRewardService } = await import('@/services/activityRewardService');
            const response = await ActivityRewardService.logActivity({
              userId: newUserId,
              actionType: "complete_profile" as any, // Welcome bonus for new users
              metadata: {
                referralCode: codeToProcess,
                isWelcomeBonus: true
              }
            });

            // Show success notification
            const { toast } = await import('@/hooks/use-toast');
            toast({
              title: "Welcome Bonus!",
              description: "You've received bonus SoftPoints for joining through a referral!",
            });
          } catch (activityError) {
            console.error('Error logging welcome bonus:', activityError);
          }
        }
      } catch (referralError) {
        console.error('Error processing referral:', referralError);
      }

      // Clean up referral code from localStorage if needed
      if (shouldCleanup) {
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralCodeExpiry');
      }

    } catch (error) {
      console.error('Error processing referral signup:', error);
      // Clean up on error too if needed
      if (shouldCleanup) {
        localStorage.removeItem('referralCode');
        localStorage.removeItem('referralCodeExpiry');
      }
    }
  }, []);

  // Login function
  const login = useCallback(
    async (email: string, password: string): Promise<{ error?: Error }> => {
      try {
        setIsLoading(true);
        setError(null);

        // Guard against missing Supabase configuration to avoid cryptic runtime errors
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
          const cfgErr = new Error("Supabase configuration is missing");
          console.error("Login aborted - missing Supabase env config", {
            url: import.meta.env.VITE_SUPABASE_URL,
            hasKey: !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          });
          setError(cfgErr);
          return { error: cfgErr };
        }

        console.log("Attempting login for:", email);
        console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);

        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // Log a structured error for better diagnostics
          console.error("Supabase auth error:", error);
          try {
            console.error("Error details:", {
              message: (error as any).message,
              status: (error as any).status,
              name: (error as any).name,
            });
          } catch {}
          setError(error);
          return { error };
        }

        // Immediately reflect authenticated state without waiting for onAuthStateChange
        if (data) {
          const nextSession = (data as any).session ?? null;
          const nextUser = (data as any).user ?? null;
          setSession(nextSession);
          setUser(enhanceUserData(nextUser));
          await ensureProfileExists(nextUser);
        }

        console.log("Login successful:", data.user?.id);
        return {};
      } catch (error) {
        const authError = error as Error;
        console.error("Login catch error:", authError);
        setError(authError);
        return { error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Logout error:", error);
        setError(error);
      } else {
        setUser(null);
        setSession(null);
        console.log("Logout successful");
      }
    } catch (error) {
      console.error("Logout error:", error);
      setError(error as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Signup function
  const signup = useCallback(
    async (
      email: string,
      password: string,
      name: string,
      referralCode?: string,
    ): Promise<{ error?: Error }> => {
      try {
        setIsLoading(true);
        setError(null);

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              full_name: name,
              username: email.split("@")[0],
            },
          },
        });

        if (error) {
          setError(error);
          return { error };
        }

        console.log("Signup successful:", data.user?.id);

        // Handle referral if present
        if (data.user?.id) {
          await processReferralSignup(data.user.id, referralCode);
        }

        return {};
      } catch (error) {
        const authError = error as Error;
        setError(authError);
        return { error: authError };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return user?.role === "admin" || user?.profile?.role === "admin";
  }, [user]);

  // Update user profile with type-safe profile updates
  const updateProfile = useCallback(
    async (data: Partial<UserProfile>): Promise<void> => {
      try {
        if (!user) {
          throw new Error("No user logged in");
        }

        const { error } = await supabase.auth.updateUser({
          data: {
            ...user.user_metadata,
            ...data,
          },
        });

        if (error) {
          throw error;
        }

        // Update local user state with proper typing
        setUser((prev) =>
          prev
            ? {
                ...prev,
                profile: {
                  ...prev.profile,
                  ...data,
                } as UserProfile,
              }
            : null,
        );
      } catch (error) {
        console.error("Profile update error:", error);
        throw error;
      }
    },
    [user],
  );

  const contextValue: AuthContextType = useMemo(
    () => ({
      isAuthenticated: !!session && !!user,
      isLoading,
      user,
      session,
      error,
      login,
      logout,
      signup,
      isAdmin,
      updateProfile,
    }),
    [
      session,
      user,
      isLoading,
      error,
      login,
      logout,
      signup,
      isAdmin,
      updateProfile,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
