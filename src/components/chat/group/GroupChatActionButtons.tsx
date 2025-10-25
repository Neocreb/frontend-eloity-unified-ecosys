import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Coins, 
  MessageSquare, 
  PlusCircle 
} from "lucide-react";
import { StartGroupContributionModal } from "./StartGroupContributionModal";
import { CreateGroupVoteModal } from "./CreateGroupVoteModal";

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
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showVoteModal, setShowVoteModal] = useState(false);

  const handleContributionCreated = () => {
    setShowContributionModal(false);
    onAction?.();
  };

  const handleVoteCreated = () => {
    setShowVoteModal(false);
    onAction?.();
  };

  return (
    <>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowContributionModal(true)}
          disabled={!isAdmin}
        >
          <Coins className="w-4 h-4 mr-2" />
          Contribution
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowVoteModal(true)}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Vote
        </Button>
      </div>

      <StartGroupContributionModal
        groupId={groupId}
        isOpen={showContributionModal}
        onOpenChange={setShowContributionModal}
        onContributionCreated={handleContributionCreated}
      />

      <CreateGroupVoteModal
        groupId={groupId}
        isOpen={showVoteModal}
        onOpenChange={setShowVoteModal}
        onVoteCreated={handleVoteCreated}
      />
    </>
  );
};