import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SocialAuth = () => {
  const [loading, setLoading] = useState(false);

  const signInWithGithub = async () => {
    try {
      setLoading(true);
      const { error, data } = await supabase.auth.signInWithOAuth({ provider: "github" });
      if (error) {
        console.error("GitHub OAuth error:", error);
        alert("GitHub sign-in failed. Ensure GitHub is enabled in Supabase Auth > Providers.");
      }
      // Supabase will redirect or open popup automatically
    } catch (e) {
      console.error("GitHub OAuth exception:", e);
      alert("GitHub sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative mt-4">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2">
        <Button variant="outline" className="w-full" onClick={signInWithGithub} disabled={loading}>
          <Github className="mr-2 h-4 w-4" /> {loading ? "Connecting..." : "GitHub"}
        </Button>
      </div>
    </>
  );
};

export default SocialAuth;
