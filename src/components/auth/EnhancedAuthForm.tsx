import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/hooks/use-notification";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AuthHeader from "./AuthHeader";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import SocialAuth from "./SocialAuth";
import AuthFooter from "./AuthFooter";
import { supabase } from "@/integrations/supabase/client";

const EnhancedAuthForm = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, signup, error: authError } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const notification = useNotification();
  const navigate = useNavigate();

  // Auto-fill referral code from URL parameters
  useEffect(() => {
    const refParam = searchParams.get('ref');
    if (refParam) {
      setReferralCode(refParam.toUpperCase());
      setIsLogin(false); // Switch to register tab when referral code is present
      notification.info("Referral code detected! Complete registration to receive your bonus.");
    }
  }, [searchParams, notification]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      console.log(`Attempting to ${isLogin ? 'login' : 'register'} user: ${email}`);

      if (isLogin) {
        const result = await login(email, password);
        if (result.error) {
          let errorMessage = result.error.message || "Login failed";

          // Provide more helpful error messages
          if (errorMessage === "Invalid login credentials") {
            errorMessage = "Invalid email or password. Please check your credentials and try again.";
          }

          setError(errorMessage);
          notification.error(errorMessage);
          console.error("Login error:", result.error);
        } else {
          notification.success("Successfully logged in!");
          console.log("Login successful, navigating to /feed");
          navigate("/app/feed", { replace: true });
        }
      } else {
        if (!name) {
          const nameError = "Name is required";
          setError(nameError);
          notification.error(nameError);
          setIsSubmitting(false);
          return;
        }

        const result = await signup(email, password, name, referralCode || undefined);
        if (result.error) {
          let errorMessage = result.error.message || "Registration failed";

          // Provide more helpful error messages
          if (errorMessage === "User already registered") {
            errorMessage = "An account with this email already exists. Please try logging in instead.";
            // Automatically switch to login tab when user already exists
            setTimeout(() => {
              setIsLogin(true);
              notification.info("Switched to login. Please enter your password to sign in.");
            }, 2000);
          }

          setError(errorMessage);
          notification.error(errorMessage);
          console.error("Registration error:", result.error);
        } else {
          notification.success("Registration successful! Please check your email for verification.");
          console.log("Registration successful, navigating to /feed");
          navigate("/app/feed", { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Auth submission error:", err);
      const errorMessage = err.message || "Authentication failed";
      setError(errorMessage);
      notification.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!email) {
        const msg = "Enter your email to reset your password";
        setError(msg);
        notification.info(msg);
        return;
      }
      await supabase.auth.resetPasswordForEmail(email);
      notification.success("Password reset email sent. Check your inbox.");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to send reset email";
      setError(errorMessage);
      notification.error(errorMessage);
    }
  };


  // Use the combined error from auth context and local state
  const displayError = error || (authError ? authError.message : null);

  // Helper component for error display with actionable guidance
  const ErrorHelper = ({ error }: { error: string | null }) => {
    if (!error) return null;

    const isLoginCredentialsError = error.includes("Invalid email or password");
    const isUserExistsError = error.includes("account with this email already exists");

    return (
      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
        <p className="text-sm text-red-600 mb-2">{error}</p>
        {isLoginCredentialsError && (
          <div className="text-xs text-red-500">
            <p>• Double-check your email address</p>
            <p>• Make sure your password is correct</p>
          </div>
        )}
        {isUserExistsError && (
          <div className="text-xs text-red-500">
            <p>• Use the Login tab instead of Register</p>
            <p>• Click "Forgot password?" if you don't remember it</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-md mx-auto shawdow-2xl rounded-lg">
      <CardHeader className="space-y-1 text-center">
        <AuthHeader isLogin={isLogin} />
        <ErrorHelper error={displayError} />
      </CardHeader>
      <Tabs defaultValue={referralCode ? "register" : "login"} onValueChange={(val) => setIsLogin(val === "login")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Login</TabsTrigger>
          <TabsTrigger value="register">Register</TabsTrigger>
        </TabsList>
        <CardContent className="pt-4">

          <TabsContent value="login">
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSubmitting={isSubmitting}
              error={displayError}
              onSubmit={handleSubmit}
              onForgotPassword={handleForgotPassword}
            />
          </TabsContent>

          <TabsContent value="register">
            <RegisterForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              referralCode={referralCode}
              setReferralCode={setReferralCode}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              isSubmitting={isSubmitting}
              error={displayError}
              onSubmit={handleSubmit}
            />
          </TabsContent>

          <SocialAuth />
        </CardContent>
      </Tabs>
      <CardFooter className="flex flex-col">
        <AuthFooter />
      </CardFooter>
    </Card>
  );
};

export default EnhancedAuthForm;
