import { CardTitle, CardDescription } from "@/components/ui/card";
import EloityLogo from "@/components/ui/logo";

interface AuthHeaderProps {
  isLogin: boolean;
}

const AuthHeader = ({ isLogin }: AuthHeaderProps) => {
  return (
    <>
      <div className="flex justify-center mb-2">
        <EloityLogo className="h-10 w-10" />
      </div>
      <CardTitle className="text-2xl">Welcome to Eloity</CardTitle>
      <CardDescription>
        {isLogin ? "Login to your account" : "Create a new account"}
      </CardDescription>
    </>
  );
};

export default AuthHeader;
