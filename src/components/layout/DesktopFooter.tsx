import { Link } from "react-router-dom";
import {
  Home,
  Search,
  Video,
  ShoppingCart,
  TrendingUp,
  Briefcase,
  Award,
  Users,
  MessageCircle,
  Settings,
  User,
  Bell,
  Wallet,
  Globe,
  HelpCircle,
  Shield,
  FileText,
  Mail,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import EloityLogo from "@/components/ui/logo";

const DesktopFooter = () => {
  return (
    <footer className="hidden md:block border-t bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <EloityLogo className="h-6 w-6" variant="icon" showText={false} />
              <span className="font-bold text-lg text-primary">Eloity</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The ultimate social platform for creators, traders, and
              professionals.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>© 2024 Eloity</span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Platform</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/app/feed"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Feed
              </Link>
              <Link
                to="/app/explore"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Explore
              </Link>
              <Link
                to="/app/videos"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Video className="h-4 w-4" />
                Videos
              </Link>
              <Link
                to="/app/marketplace"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Marketplace
              </Link>
            </nav>
          </div>

          {/* Trading & Business */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Trading & Business</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/app/crypto"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Crypto Trading
              </Link>
              <Link
                to="/app/create"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Briefcase className="h-4 w-4" />
                Freelance
              </Link>
              <Link
                to="/app/rewards"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Award className="h-4 w-4" />
                Rewards
              </Link>
              <Link
                to="/app/wallet"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Wallet className="h-4 w-4" />
                Wallet
              </Link>
            </nav>
          </div>

          {/* Account & Support */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm">Account & Support</h3>
            <nav className="flex flex-col space-y-2">
              <Link
                to="/app/profile"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/app/settings"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
              <Link
                to="/app/notifications"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Notifications
              </Link>
              <Link
                to="/app/chat"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Messages
              </Link>
            </nav>
          </div>

          {/* Legal & Resources - Only on larger screens */}
          <div className="space-y-4 hidden lg:block">
            <h3 className="font-semibold text-sm">Resources</h3>
            <nav className="flex flex-col space-y-2">
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Help Center
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Privacy Policy
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Terms of Service
              </a>
              <a
                href="#"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Contact
              </a>
            </nav>
          </div>
        </div>

        <Separator className="my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2024 Eloity. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/app/profile"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Profile
            </Link>
            <Link
              to="/app/settings"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Settings
            </Link>
            <Link
              to="/app/help"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Help
            </Link>
            <Link
              to="/app/privacy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default DesktopFooter;
