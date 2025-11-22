import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WalletActionHeader } from "@/components/wallet/WalletActionHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

const MoneyRequest = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState<"recipient" | "amount" | "message" | "review" | "success">("recipient");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Mock user search
  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setHasSearched(true);

    const mockUsers: User[] = [
      { id: "1", name: "John Doe", username: "johndoe", email: "john@example.com", avatar: "👤" },
      { id: "2", name: "Jane Smith", username: "janesmith", email: "jane@example.com", avatar: "👩" },
      { id: "3", name: "Mike Johnson", username: "mikej", email: "mike@example.com", avatar: "👨" },
    ];

    const results = mockUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setSearchResults(results);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setStep("success");
    } finally {
      setIsLoading(false);
    }
  };

  const numAmount = parseInt(amount) || 0;
  const canProceed = selectedRecipient && numAmount > 0;

  if (step === "success") {
    return (
      <div className="flex flex-col h-screen bg-gray-50">
        <WalletActionHeader title="Request Sent" />
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Request Sent!</h2>
            <p className="text-gray-600">
              Money request for ₦{numAmount.toLocaleString()} sent to {selectedRecipient?.name}
            </p>
            <p className="text-sm text-gray-500">They'll receive a notification</p>
            <Button onClick={() => navigate("/app/wallet")} className="w-full mt-6">
              Back to Wallet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <WalletActionHeader title="Request Money" subtitle="Ask others to send you money" />
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 sm:p-6 space-y-6">
          {step === "recipient" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Search Recipient
                </label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Username, email, or name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="text-lg"
                  />
                  <Button
                    onClick={handleSearch}
                    className="bg-blue-600 hover:bg-blue-700"
                    size="lg"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {hasSearched && searchResults.length === 0 && (
                <Card className="border-0 shadow-sm bg-blue-50">
                  <CardContent className="pt-6">
                    <p className="text-center text-gray-600">No users found</p>
                  </CardContent>
                </Card>
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Search Results</h3>
                  <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
                    {searchResults.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setSelectedRecipient(u);
                          setStep("amount");
                        }}
                        className="p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-3xl">{u.avatar || "👤"}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-600">@{u.username}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "amount" && selectedRecipient && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedRecipient(null);
                  setStep("recipient");
                }}
                className="text-blue-600"
              >
                ← Change Recipient
              </Button>

              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{selectedRecipient.avatar || "👤"}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{selectedRecipient.name}</p>
                      <p className="text-xs text-gray-600">@{selectedRecipient.username}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount to Request
                </label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                />
              </div>

              {canProceed && (
                <Button
                  onClick={() => setStep("message")}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  Continue
                </Button>
              )}
            </div>
          )}

          {step === "message" && selectedRecipient && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("amount")}
                className="text-blue-600"
              >
                ← Back
              </Button>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message (Optional)
                </label>
                <textarea
                  placeholder="Add a message to your request..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                  rows={4}
                />
              </div>

              <Button
                onClick={() => setStep("review")}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Review Request
              </Button>
            </div>
          )}

          {step === "review" && selectedRecipient && (
            <div className="space-y-4">
              <Button
                variant="ghost"
                onClick={() => setStep("message")}
                className="text-blue-600"
              >
                ← Back
              </Button>

              <Card className="border-0 shadow-sm bg-blue-50">
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Requesting from</p>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{selectedRecipient.avatar || "👤"}</div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedRecipient.name}</p>
                        <p className="text-xs text-gray-600">@{selectedRecipient.username}</p>
                      </div>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600">Amount</span>
                      <span className="font-semibold text-lg">₦{numAmount.toLocaleString()}</span>
                    </div>
                    {message && (
                      <div className="mt-4">
                        <p className="text-xs text-gray-600 mb-2">Message</p>
                        <p className="text-sm text-gray-700 p-3 bg-white rounded border border-gray-200">
                          {message}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Request"
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MoneyRequest;
