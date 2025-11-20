import React from "react";
import { Button } from "@/components/ui/button";
import {
  Coins,
  MessageSquare,
  PlusCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GroupChatActionButtonsProps {
  groupId: string;
  isAdmin: boolean;
  onAction?: () => void;
}

export const GroupChatActionButtons: React.FC<GroupChatActionButtonsProps> = ({
  groupId,
  isAdmin,
  onAction,
}) => {
  const navigate = useNavigate();

  const handleContributionClick = () => {
    navigate(`/app/community/group-contribution/${groupId}`);
    onAction?.();
  };

  const handleVoteClick = () => {
    navigate(`/app/community/vote/${groupId}`);
    onAction?.();
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleContributionClick}
        disabled={!isAdmin}
      >
        <Coins className="w-4 h-4 mr-2" />
        Contribution
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleVoteClick}
      >
        <MessageSquare className="w-4 h-4 mr-2" />
        Vote
      </Button>
    </div>
  );
};
