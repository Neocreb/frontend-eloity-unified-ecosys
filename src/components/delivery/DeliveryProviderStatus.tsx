// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Shield,
  DollarSign,
  Star,
  TrendingUp,
  ArrowRight,
  Mail,
  Phone,
} from "lucide-react";
import { useDeliveryProvider } from "@/hooks/use-delivery-provider";
import { useAuth } from "@/contexts/AuthContext";

interface DeliveryProviderStatusProps {
  onClose?: () => void;
  open?: boolean;
}

const benefits = [
  {
    icon: DollarSign,
    title: "Earn $15-25/hour",
    description: "Competitive rates with weekly payouts",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    description: "Work when you want, where you want",
  },
  {
    icon: Shield,
    title: "Insurance Coverage",
    description: "Complete protection during deliveries",
  },
  {
    icon: Star,
    title: "Customer Ratings",
    description: "Build your reputation and earn more",
  },
];

export default function DeliveryProviderStatus({
  onClose,
  open = true,
}: DeliveryProviderStatusProps) {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const providerStatus = useDeliveryProvider();

  const getStatusCard = () => {
    if (!isAuthenticated || !user) {
      return (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <User className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">Login Required</h3>
                <p className="text-sm text-blue-700">Please login to access delivery provider features</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => navigate("/auth")}>
              Login to Continue
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (providerStatus.loading) {
      return (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking your provider status...</p>
          </CardContent>
        </Card>
      );
    }

    if (providerStatus.isProvider) {
      switch (providerStatus.status) {
        case "pending":
          return (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-600 p-2 rounded-lg">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-yellow-900">Application Under Review</h3>
                    <p className="text-sm text-yellow-700">We're reviewing your delivery provider application</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Review Status</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Application submitted</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        <span>Document verification in progress</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Background check pending</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-yellow-700">
                    We'll email you within 2-3 business days with an update on your application status.
                  </p>
                </div>
              </CardContent>
            </Card>
          );

        case "rejected":
          return (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-red-600 p-2 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-red-900">Application Not Approved</h3>
                    <p className="text-sm text-red-700">Your application didn't meet our current requirements</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What can you do?</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Review our updated requirements</li>
                      <li>• Reapply after addressing feedback</li>
                      <li>• Contact support for clarification</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate("/app/delivery/provider/register")}
                    >
                      Apply Again
                    </Button>
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-1" />
                      Contact Support
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );

        case "suspended":
          return (
            <Card className="bg-orange-50 border-orange-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-600 p-2 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-900">Account Suspended</h3>
                    <p className="text-sm text-orange-700">Your delivery provider account has been temporarily suspended</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What happened?</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Your account is under review for policy violations</li>
                      <li>• Delivery privileges are temporarily disabled</li>
                      <li>• Contact support for more information</li>
                    </ul>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support for Appeal
                  </Button>
                </div>
              </CardContent>
            </Card>
          );

        default:
          return (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-green-900">Verified Provider</h3>
                    <p className="text-sm text-green-700">You're approved and ready to accept deliveries</p>
                  </div>
                </div>
                <Button 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => navigate("/app/delivery/provider/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
      }
    }

    // Not a provider - show application prompt
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <div className="bg-blue-600 p-3 rounded-full w-fit mx-auto mb-4">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-medium text-blue-900 mb-2">
              You're not a delivery provider yet
            </h3>
            <p className="text-blue-700">
              Join our network of professional delivery drivers and start earning on your schedule
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-3">
              {benefits.map((benefit, index) => (
                <div key={index} className="bg-white p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <benefit.icon className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-sm">{benefit.title}</span>
                  </div>
                  <p className="text-xs text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate("/app/delivery/provider/register")}
            >
              Apply to Become a Provider
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => window.open("/delivery/apply", "_blank")}
            >
              Learn More
            </Button>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-blue-800">4.8 average rating</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-blue-800">1,250+ active drivers</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold mb-2">Delivery Hub</h1>
        <p className="text-gray-600 text-lg">
          Manage your delivery provider status and access your dashboard
        </p>
      </div>

      {getStatusCard()}

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Email Support</p>
                <p className="text-sm text-gray-600">drivers@platform.com</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium">Call Us</p>
                <p className="text-sm text-gray-600">1-800-DELIVERY</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
