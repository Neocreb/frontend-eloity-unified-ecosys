// @ts-nocheck
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessageCircle,
  Send,
  Paperclip,
  Star,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import { JobPosting } from "@/types/freelance";
import { useToast } from "@/hooks/use-toast";

interface MessageClientModalProps {
  job: JobPosting;
  isOpen: boolean;
  onClose: () => void;
  onSend?: (message: string, subject: string) => void;
}

export const MessageClientModal: React.FC<MessageClientModalProps> = ({
  job,
  isOpen,
  onClose,
  onSend,
}) => {
  const [subject, setSubject] = useState(`Inquiry about: ${job.title}`);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message before sending.",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      onSend?.(message, subject);

      toast({
        title: "Message Sent Successfully!",
        description: `Your message has been sent to ${job.client.name}. They typically respond within ${job.client.responseTime || "24 hours"}.`,
        variant: "default",
      });

      onClose();
      setMessage("");
      setSubject(`Inquiry about: ${job.title}`);
    } catch (error) {
      toast({
        title: "Failed to Send Message",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const messageTemplates = [
    {
      title: "Express Interest",
      content: `Hi ${job.client.name},\n\nI'm very interested in your "${job.title}" project. I have extensive experience in the required skills and would love to discuss how I can help bring your vision to life.\n\nCould we schedule a brief call to discuss the project requirements in more detail?\n\nBest regards,`,
    },
    {
      title: "Ask Questions",
      content: `Hi ${job.client.name},\n\nI'm interested in your "${job.title}" project and have a few questions to better understand the scope:\n\n1. What is the expected timeline for completion?\n2. Are there any specific design preferences or existing brand guidelines?\n3. What will be the preferred communication method during the project?\n\nI look forward to hearing from you.\n\nBest regards,`,
    },
    {
      title: "Portfolio Showcase",
      content: `Hi ${job.client.name},\n\nI came across your "${job.title}" project and wanted to share some relevant work from my portfolio that aligns with your requirements.\n\nI've successfully completed similar projects with excellent results and would be excited to discuss how my experience can benefit your project.\n\nWould you be available for a quick discussion?\n\nBest regards,`,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Message Client
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Client Info Card */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={job.client.avatar} />
                  <AvatarFallback>{job.client.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg">{job.client.name}</h3>
                    {job.client.verified && (
                      <Shield className="w-4 h-4 text-blue-600" />
                    )}
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {job.client.rating}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {job.client.location} • Member since{" "}
                    {new Date(job.client.memberSince).getFullYear()}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{job.client.jobsPosted} jobs posted</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span>{job.client.hireRate}% hire rate</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Job Reference */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Regarding Job:</h4>
            <h3 className="font-semibold text-lg text-blue-700 line-clamp-2">
              {job.title}
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                ${job.budget.min}-${job.budget.max}
                {job.budget.type === "hourly" ? "/hr" : ""}
              </span>
              <span>{job.proposals} proposals</span>
              <Badge variant="outline" className="text-xs">
                {job.experience} level
              </Badge>
            </div>
          </div>

          {/* Message Templates */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Quick Templates:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {messageTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(template.content)}
                  className="text-left h-auto py-2 px-3"
                >
                  <div>
                    <div className="font-medium text-xs">{template.title}</div>
                    <div className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {template.content.substring(0, 50)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Subject Line */}
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium">
              Subject Line
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter subject line..."
              className="w-full"
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message *
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message to the client..."
              className="min-h-32 resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                Be professional and specific about your interest or questions
              </span>
              <span>{message.length}/2000</span>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800 mb-1">
                  Tips for messaging clients:
                </div>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Be specific about your relevant experience</li>
                  <li>• Ask thoughtful questions about the project</li>
                  <li>• Keep it professional and concise</li>
                  <li>• Mention your availability if interested</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Typical response time: 24 hours</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} disabled={isSending}>
              Cancel
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !message.trim()}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MessageClientModal;
