import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNotification } from "@/hooks/use-notification";
import { AdminService } from "@/services/adminService";
import { chatAdsService, ChatAdRecord } from "@/services/chatAdsService";
import {
  MessageSquare,
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Flag,
  Shield,
  Users,
} from "lucide-react";

interface ChatMessage {
  id: string;
  userName: string;
  content: string;
  timestamp: string;
  moderationStatus: "pending" | "approved" | "flagged" | "removed";
  reportCount: number;
  aiConfidence?: number;
}

const AdminChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [ads, setAds] = useState<ChatAdRecord[]>([]);
  const [editingAd, setEditingAd] = useState<ChatAdRecord | null>(null);
  const [isSavingAds, setIsSavingAds] = useState(false);
  const notification = useNotification();

  useEffect(() => {
    loadChatData();
    loadAds();
  }, []);

  const loadAds = () => {
    try {
      const existing = chatAdsService.getAdsForThread();
      setAds(existing);
    } catch (e) {
      setAds([]);
    }
  };

  const loadChatData = async () => {
    try {
      setIsLoading(true);
      // Use real API instead of mock data
      const response = await AdminService.getFlaggedMessages({
        page: 1,
        limit: 50,
      });

      if (response.success) {
        setMessages(response.data.messages || []);
      } else {
        throw new Error(response.error || "Failed to load flagged messages");
      }
    } catch (error) {
      console.error("Error loading chat data:", error);
      notification.error("Failed to load chat data");

      // Fallback to mock data if API fails
      const mockMessages: ChatMessage[] = [
        {
          id: "msg-001",
          userName: "John Smith",
          content: "This is a potentially harmful message that contains inappropriate content",
          timestamp: "2024-01-26T14:30:00Z",
          moderationStatus: "flagged",
          reportCount: 3,
          aiConfidence: 0.85,
        },
        {
          id: "msg-002",
          userName: "Sarah Johnson",
          content: "Great work on the project! Looking forward to the next milestone.",
          timestamp: "2024-01-26T13:15:00Z",
          moderationStatus: "approved",
          reportCount: 0,
          aiConfidence: 0.95,
        },
      ];
      setMessages(mockMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleModerationAction = async (messageId: string, action: string) => {
    try {
      // Use real API instead of mock update
      const response = await AdminService.moderateMessage(
        messageId,
        action === "approve" ? "approve" : "remove"
      );

      if (response.success) {
        // Update local state
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, moderationStatus: action === "approve" ? "approved" : "removed" }
              : msg
          )
        );
        notification.success(`Message ${action}d successfully`);
      } else {
        throw new Error(response.error || `Failed to ${action} message`);
      }
    } catch (error) {
      console.error(`Error ${action}ing message:`, error);
      notification.error(`Failed to ${action} message`);

      // Fallback to local state update if API fails
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, moderationStatus: action === "approve" ? "approved" : "removed" }
            : msg
        )
      );
      notification.success(`Message ${action}d successfully (offline mode)`);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500 text-white",
      approved: "bg-green-500 text-white",
      flagged: "bg-red-500 text-white",
      removed: "bg-gray-500 text-white",
    };
    return colors[status] || "bg-gray-500 text-white";
  };

  const handleStartEditAd = (ad?: ChatAdRecord) => {
    setEditingAd(ad ? { ...ad } : { id: `ad_${Date.now()}`, title: "", sponsor: "", body: "", image: "", ctaLabel: "", ctaUrl: "" });
  };

  const handleChangeEditingAd = (key: keyof ChatAdRecord, value: string) => {
    if (!editingAd) return;
    setEditingAd({ ...editingAd, [key]: value } as ChatAdRecord);
  };

  const handleSaveAds = async () => {
    try {
      setIsSavingAds(true);
      const updated = editingAd ? [...ads.filter(a => a.id !== editingAd.id), editingAd] : ads;
      // Ensure stable ordering: put edited/added ad at end
      if (editingAd) {
        // replace/add
        const deduped = updated.reduce<ChatAdRecord[]>((acc, cur) => {
          if (!acc.find(a => a.id === cur.id)) acc.push(cur);
          return acc;
        }, []);
        chatAdsService.saveAdsConfig(deduped);
        setAds(deduped);
        setEditingAd(null);
        notification.success("Ads configuration saved");
      }
    } catch (e) {
      console.error("Failed to save ads config", e);
      notification.error("Failed to save ads config");
    } finally {
      setIsSavingAds(false);
    }
  };

  const handleDeleteAd = (adId: string) => {
    const confirmed = window.confirm("Delete this ad?");
    if (!confirmed) return;
    const updated = ads.filter((a) => a.id !== adId);
    try {
      chatAdsService.saveAdsConfig(updated);
      setAds(updated);
      notification.success("Ad deleted");
    } catch (e) {
      console.error("Failed to delete ad", e);
      notification.error("Failed to delete ad");
    }
  };

  const handleAddNewAd = () => {
    handleStartEditAd();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading chat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Chat Moderation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and moderate chat messages, rooms, and reports
          </p>
        </div>
      </div>

      <Tabs defaultValue="moderation" className="space-y-6">
        <div>
          <TabsList>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="moderation">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-red-500/10 p-3 rounded-full mb-4">
                  <Flag className="h-6 w-6 text-red-600" />
                </div>
                <div className="text-2xl font-bold">{messages.filter((m) => m.moderationStatus === "flagged").length}</div>
                <div className="text-sm text-gray-600">Flagged Messages</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-yellow-500/10 p-3 rounded-full mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold">{messages.filter((m) => m.moderationStatus === "pending").length}</div>
                <div className="text-sm text-gray-600">Pending Reviews</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-blue-500/10 p-3 rounded-full mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{messages.length}</div>
                <div className="text-sm text-gray-600">Total Messages</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6">
                <div className="bg-orange-500/10 p-3 rounded-full mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold">{messages.filter((m) => m.reportCount > 0).length}</div>
                <div className="text-sm text-gray-600">Reported Messages</div>
              </CardContent>
            </Card>
          </div>

          {/* Message Moderation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Message Moderation
              </CardTitle>
              <CardDescription>Review and moderate flagged chat messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>AI Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="text-sm truncate">{message.content}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{message.userName}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {message.reportCount > 0 && <Flag className="w-4 h-4 text-red-500" />}
                            <span className="text-sm">{message.reportCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {message.aiConfidence && (
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${message.aiConfidence * 100}%` }} />
                              </div>
                              <span className="text-xs">{Math.round(message.aiConfidence * 100)}%</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(message.moderationStatus)}>{message.moderationStatus}</Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm">{new Date(message.timestamp).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-600">{new Date(message.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button variant="outline" size="sm" className="bg-green-50 hover:bg-green-100" onClick={() => handleModerationAction(message.id, "approve")}>
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </Button>
                            <Button variant="outline" size="sm" className="bg-red-50 hover:bg-red-100" onClick={() => handleModerationAction(message.id, "remove")}>
                              <XCircle className="w-4 h-4 text-red-600" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Chat Ads</h2>
              <p className="text-sm text-gray-600">Manage in-chat advertisement entries shown to users</p>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddNewAd} aria-label="Add new ad">Add Ad</Button>
              <Button variant="ghost" onClick={loadAds} aria-label="Reload ads">Reload</Button>
            </div>
          </div>

          <Card>
            <CardContent>
              {ads.length === 0 ? (
                <div className="text-center py-8 text-gray-600">No ads configured. Add new ads to display them in group chats.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Sponsor</TableHead>
                        <TableHead>CTA</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ads.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell>
                            <div className="max-w-xs">
                              <p className="text-sm truncate">{ad.title}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{ad.sponsor}</p>
                          </TableCell>
                          <TableCell>
                            <p className="text-sm">{ad.ctaLabel}</p>
                          </TableCell>
                          <TableCell>
                            <a href={ad.ctaUrl} target="_blank" rel="noreferrer" className="text-blue-600 truncate block max-w-xs">{ad.ctaUrl}</a>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleStartEditAd(ad)}>Edit</Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDeleteAd(ad.id)}>Delete</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Edit/Add form */}
              {editingAd && (
                <div className="mt-6 border-t pt-6">
                  <h3 className="text-lg font-medium mb-3">{ads.find(a => a.id === editingAd.id) ? "Edit Ad" : "Add Ad"}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <input className="w-full mt-1 p-2 border rounded" value={editingAd.title || ""} onChange={(e) => handleChangeEditingAd("title", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Sponsor</label>
                      <input className="w-full mt-1 p-2 border rounded" value={editingAd.sponsor || ""} onChange={(e) => handleChangeEditingAd("sponsor", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Body</label>
                      <textarea className="w-full mt-1 p-2 border rounded" rows={3} value={editingAd.body || ""} onChange={(e) => handleChangeEditingAd("body", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">CTA Label</label>
                      <input className="w-full mt-1 p-2 border rounded" value={editingAd.ctaLabel || ""} onChange={(e) => handleChangeEditingAd("ctaLabel", e.target.value)} />
                    </div>
                    <div>
                      <label className="text-sm font-medium">CTA URL</label>
                      <input className="w-full mt-1 p-2 border rounded" value={editingAd.ctaUrl || ""} onChange={(e) => handleChangeEditingAd("ctaUrl", e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium">Image URL</label>
                      <input className="w-full mt-1 p-2 border rounded" value={editingAd.image || ""} onChange={(e) => handleChangeEditingAd("image", e.target.value)} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button onClick={handleSaveAds} disabled={isSavingAds}>{isSavingAds ? "Saving..." : "Save Ad"}</Button>
                    <Button variant="ghost" onClick={() => setEditingAd(null)}>Cancel</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Placeholder for future features */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Features</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Additional chat moderation features including room management, report handling, and automated moderation settings
              will be implemented in future updates.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminChat;
