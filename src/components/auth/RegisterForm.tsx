import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CircleOff, Gift } from "lucide-react";

interface RegisterFormProps {
  name: string;
  setName: (value: string) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  referralCode: string;
  setReferralCode: (value: string) => void;
  showPassword: boolean;
  setShowPassword: (value: boolean) => void;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (e: React.FormEvent) => Promise<void>;
}

const RegisterForm = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  referralCode,
  setReferralCode,
  showPassword,
  setShowPassword,
  isSubmitting,
  error,
  onSubmit,
}: RegisterFormProps) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="John Doe"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>• At least 8 characters</p>
          <p>• Use a strong, unique password</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referralCode" className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-purple-500" />
          Referral Code
          <span className="text-xs text-muted-foreground">(Optional)</span>
        </Label>
        <Input
          id="referralCode"
          type="text"
          placeholder="Enter referral code"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
          className="uppercase"
        />
        {referralCode && (
          <div className="text-xs text-green-600 flex items-center gap-1">
            <Gift className="h-3 w-3" />
            <span>You'll receive bonus rewards when you join!</span>
          </div>
        )}
      </div>

      {error && (
        <div className="text-destructive text-sm flex items-center gap-1">
          <CircleOff className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Processing..." : "Create Account"}
      </Button>

      <div className="mt-4 text-center text-xs text-muted-foreground">
        <p>Already have an account? Switch to the Login tab.</p>
      </div>
    </form>
  );
};

export default RegisterForm;
