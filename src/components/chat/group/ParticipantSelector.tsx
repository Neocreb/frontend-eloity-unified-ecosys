import React, { useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatParticipant } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ParticipantSelectorProps {
  contacts: ChatParticipant[];
  selectedParticipants: string[];
  onParticipantsChange: (selectedIds: string[]) => void;
  excludeUserIds?: string[];
  showSelectedCount?: boolean;
  className?: string;
}

export const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  contacts,
  selectedParticipants,
  onParticipantsChange,
  excludeUserIds = [],
  showSelectedCount = false,
  className,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter out excluded users and apply search
  const filteredContacts = contacts
    .filter(contact => !excludeUserIds.includes(contact.id))
    .filter(contact =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleToggle = (participantId: string) => {
    const newSelection = selectedParticipants.includes(participantId)
      ? selectedParticipants.filter(id => id !== participantId)
      : [...selectedParticipants, participantId];
    onParticipantsChange(newSelection);
  };

  const handleRemove = (participantId: string) => {
    onParticipantsChange(selectedParticipants.filter(id => id !== participantId));
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Selected participants chips */}
      {showSelectedCount && selectedParticipants.length > 0 && (
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            Selected ({selectedParticipants.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedParticipants.map(participantId => {
              const participant = contacts.find(c => c.id === participantId);
              if (!participant) return null;
              return (
                <div
                  key={participantId}
                  className="flex items-center gap-2 px-3 py-1 bg-secondary rounded-full text-sm"
                >
                  <Avatar className="h-5 w-5">
                    <AvatarImage src={participant.avatar} alt={participant.name} />
                    <AvatarFallback className="text-xs">
                      {participant.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate max-w-24">{participant.name}</span>
                  <button
                    onClick={() => handleRemove(participantId)}
                    className="h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/40"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Contact list */}
      <ScrollArea className="h-80">
        <div className="space-y-1 pr-4">
          {filteredContacts.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              {searchQuery ? "No contacts found" : "No contacts available"}
            </p>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                onClick={() => handleToggle(contact.id)}
              >
                <Checkbox
                  checked={selectedParticipants.includes(contact.id)}
                  onCheckedChange={() => handleToggle(contact.id)}
                />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={contact.avatar} alt={contact.name} />
                  <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{contact.name}</p>
                  {contact.username && (
                    <p className="text-xs text-muted-foreground">@{contact.username}</p>
                  )}
                </div>
                {contact.isOnline && (
                  <div className="h-2 w-2 bg-green-500 rounded-full" />
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
