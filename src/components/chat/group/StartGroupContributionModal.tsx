import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { GroupContributionService } from "@/services/groupContributionService";
import { useAuth } from "@/contexts/AuthContext";
import { Coins, Calendar, Hash } from "lucide-react";

interface StartGroupContributionModalProps {
  groupId: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onContributionCreated?: () => void;
}

export const StartGroupContributionModal: React.FC<StartGroupContributionModalProps> = ({
  groupId,
  trigger,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onContributionCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"fixed" | "custom">("fixed");
  const [targetAmount, setTargetAmount] = useState<number | undefined>(undefined);
  const [currency, setCurrency] = useState("ELOITY");
  const [durationValue, setDurationValue] = useState<number>(7);
  const [durationUnit, setDurationUnit] = useState<"days" | "weeks" | "months">("days");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to start a contribution",
        variant: "destructive",
      });
      return;
    }

    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your contribution",
        variant: "destructive",
      });
      return;
    }

    if (type === "fixed" && (!targetAmount || targetAmount <= 0)) {
      toast({
        title: "Target Amount Required",
        description: "Please enter a valid target amount for fixed contributions",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await GroupContributionService.createContribution({
        group_id: groupId,
        title,
        description,
        type,
        target_amount: targetAmount,
        currency,
        duration_value: durationValue,
        duration_unit: durationUnit,
      }, user.id);

      if (result) {
        toast({
          title: "Contribution Created",
          description: "Your group contribution has been successfully created!",
        });
        
        // Reset form
        setTitle("");
        setDescription("");
        setType("fixed");
        setTargetAmount(undefined);
        setCurrency("ELOITY");
        setDurationValue(7);
        setDurationUnit("days");
        
        onOpenChange(false);
        onContributionCreated?.();
      } else {
        throw new Error("Failed to create contribution");
      }
    } catch (error) {
      console.error("Error creating contribution:", error);
      toast({
        title: "Error",
        description: "Failed to create contribution. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (trigger) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              Start Group Contribution
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Birthday Gift, Investment Fund"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the purpose of this contribution..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Contribution Type</Label>
              <Select value={type} onValueChange={(value: "fixed" | "custom") => setType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Amount (same for all members)</SelectItem>
                  <SelectItem value="custom">Custom Amount (each member contributes what they can)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {type === "fixed" && (
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Target Amount</Label>
                <div className="flex gap-2">
                  <Input
                    id="targetAmount"
                    type="number"
                    value={targetAmount || ""}
                    onChange={(e) => setTargetAmount(Number(e.target.value) || undefined)}
                    placeholder="Enter target amount"
                    min="1"
                  />
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ELOITY">ELOITY</SelectItem>
                      <SelectItem value="NGN">Naira (₦)</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-gray-500" />
                  <Input
                    type="number"
                    value={durationValue}
                    onChange={(e) => setDurationValue(Number(e.target.value) || 1)}
                    min="1"
                    className="w-20"
                  />
                </div>
                <Select value={durationUnit} onValueChange={(value: "days" | "weeks" | "months") => setDurationUnit(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Contribution"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-5 h-5" />
            Start Group Contribution
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Birthday Gift, Investment Fund"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the purpose of this contribution..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type">Contribution Type</Label>
            <Select value={type} onValueChange={(value: "fixed" | "custom") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed">Fixed Amount (same for all members)</SelectItem>
                <SelectItem value="custom">Custom Amount (each member contributes what they can)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {type === "fixed" && (
            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <div className="flex gap-2">
                <Input
                  id="targetAmount"
                  type="number"
                  value={targetAmount || ""}
                  onChange={(e) => setTargetAmount(Number(e.target.value) || undefined)}
                  placeholder="Enter target amount"
                  min="1"
                />
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ELOITY">ELOITY</SelectItem>
                    <SelectItem value="NGN">Naira (₦)</SelectItem>
                    <SelectItem value="USDT">USDT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-gray-500" />
                <Input
                  type="number"
                  value={durationValue}
                  onChange={(e) => setDurationValue(Number(e.target.value) || 1)}
                  min="1"
                  className="w-20"
                />
              </div>
              <Select value={durationUnit} onValueChange={(value: "days" | "weeks" | "months") => setDurationUnit(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Contribution"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};