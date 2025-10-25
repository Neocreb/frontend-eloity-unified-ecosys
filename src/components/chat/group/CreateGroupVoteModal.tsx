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
import { MessageSquare, Calendar, Hash } from "lucide-react";

interface CreateGroupVoteModalProps {
  groupId: string;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onVoteCreated?: () => void;
}

export const CreateGroupVoteModal: React.FC<CreateGroupVoteModalProps> = ({
  groupId,
  trigger,
  isOpen: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onVoteCreated,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [internalOpen, setInternalOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [durationValue, setDurationValue] = useState<number>(7);
  const [durationUnit, setDurationUnit] = useState<"hours" | "days" | "weeks">("days");
  const [requiredPercentage, setRequiredPercentage] = useState<number>(60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const onOpenChange = controlledOnOpenChange || setInternalOpen;

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to create a vote",
        variant: "destructive",
      });
      return;
    }

    if (!topic.trim()) {
      toast({
        title: "Topic Required",
        description: "Please enter a topic for your vote",
        variant: "destructive",
      });
      return;
    }

    const validOptions = options.filter(option => option.trim() !== "");
    if (validOptions.length < 2) {
      toast({
        title: "Insufficient Options",
        description: "Please enter at least 2 valid options",
        variant: "destructive",
      });
      return;
    }

    if (requiredPercentage < 50 || requiredPercentage > 100) {
      toast({
        title: "Invalid Percentage",
        description: "Required percentage must be between 50% and 100%",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await GroupContributionService.createVote({
        group_id: groupId,
        topic,
        description,
        options: validOptions,
        duration_value: durationValue,
        duration_unit: durationUnit,
        required_percentage: requiredPercentage,
      }, user.id);

      if (result) {
        toast({
          title: "Vote Created",
          description: "Your group vote has been successfully created!",
        });
        
        // Reset form
        setTopic("");
        setDescription("");
        setOptions(["", ""]);
        setDurationValue(7);
        setDurationUnit("days");
        setRequiredPercentage(60);
        
        onOpenChange(false);
        onVoteCreated?.();
      } else {
        throw new Error("Failed to create vote");
      }
    } catch (error) {
      console.error("Error creating vote:", error);
      toast({
        title: "Error",
        description: "Failed to create vote. Please try again.",
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
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Create Group Vote
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Should we release the group funds early?"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide more details about this vote..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Options</Label>
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeOption(index)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="w-full"
                >
                  Add Option
                </Button>
              )}
            </div>
            
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
                <Select value={durationUnit} onValueChange={(value: "hours" | "days" | "weeks") => setDurationUnit(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">Hours</SelectItem>
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="percentage">Required Percentage</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="percentage"
                  type="number"
                  value={requiredPercentage}
                  onChange={(e) => setRequiredPercentage(Number(e.target.value) || 60)}
                  min="50"
                  max="100"
                  className="w-20"
                />
                <span className="text-gray-500">%</span>
              </div>
              <p className="text-xs text-gray-500">
                Minimum percentage of votes needed for a decision to pass
              </p>
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
                {isSubmitting ? "Creating..." : "Create Vote"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Create Group Vote
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., Should we release the group funds early?"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about this vote..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Options</Label>
            {options.map((option, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {options.length > 2 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => removeOption(index)}
                  >
                    ×
                  </Button>
                )}
              </div>
            ))}
            {options.length < 10 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="w-full"
              >
                Add Option
              </Button>
            )}
          </div>
          
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
              <Select value={durationUnit} onValueChange={(value: "hours" | "days" | "weeks") => setDurationUnit(value)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                  <SelectItem value="weeks">Weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="percentage">Required Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                id="percentage"
                type="number"
                value={requiredPercentage}
                onChange={(e) => setRequiredPercentage(Number(e.target.value) || 60)}
                min="50"
                max="100"
                className="w-20"
              />
              <span className="text-gray-500">%</span>
            </div>
            <p className="text-xs text-gray-500">
              Minimum percentage of votes needed for a decision to pass
            </p>
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
              {isSubmitting ? "Creating..." : "Create Vote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};