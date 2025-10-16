// @ts-nocheck
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Heart, MapPin, Utensils, Gamepad2, Plane, Book } from "lucide-react";

interface Feeling {
  id: string;
  emoji: string;
  label: string;
  category: string;
}

interface Activity {
  id: string;
  icon: React.ReactNode;
  label: string;
  category: string;
}

interface FeelingActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selection: { type: 'feeling' | 'activity'; data: any }) => void;
}

const FeelingActivityModal: React.FC<FeelingActivityModalProps> = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("feelings");

  const feelings: Feeling[] = [
    // Happy
    { id: "happy", emoji: "😊", label: "happy", category: "Positive" },
    { id: "excited", emoji: "🤩", label: "excited", category: "Positive" },
    { id: "grateful", emoji: "🙏", label: "grateful", category: "Positive" },
    { id: "blessed", emoji: "✨", label: "blessed", category: "Positive" },
    { id: "amazing", emoji: "🥳", label: "amazing", category: "Positive" },
    { id: "fantastic", emoji: "🌟", label: "fantastic", category: "Positive" },
    { id: "wonderful", emoji: "😍", label: "wonderful", category: "Positive" },
    { id: "joyful", emoji: "😄", label: "joyful", category: "Positive" },
    
    // Love
    { id: "loved", emoji: "🥰", label: "loved", category: "Love" },
    { id: "romantic", emoji: "💕", label: "romantic", category: "Love" },
    { id: "caring", emoji: "❤️", label: "caring", category: "Love" },
    { id: "adored", emoji: "😘", label: "adored", category: "Love" },
    
    // Sad
    { id: "sad", emoji: "😢", label: "sad", category: "Negative" },
    { id: "disappointed", emoji: "😞", label: "disappointed", category: "Negative" },
    { id: "heartbroken", emoji: "💔", label: "heartbroken", category: "Negative" },
    { id: "lonely", emoji: "😔", label: "lonely", category: "Negative" },
    
    // Other
    { id: "tired", emoji: "😴", label: "tired", category: "Other" },
    { id: "motivated", emoji: "💪", label: "motivated", category: "Other" },
    { id: "peaceful", emoji: "😌", label: "peaceful", category: "Other" },
    { id: "confused", emoji: "🤔", label: "confused", category: "Other" },
    { id: "proud", emoji: "😎", label: "proud", category: "Other" },
    { id: "relaxed", emoji: "😊", label: "relaxed", category: "Other" },
  ];

  const activities: Activity[] = [
    // Eating
    { id: "eating", icon: <Utensils className="h-5 w-5" />, label: "eating delicious food", category: "Food" },
    { id: "cooking", icon: <Utensils className="h-5 w-5" />, label: "cooking", category: "Food" },
    { id: "dining", icon: <Utensils className="h-5 w-5" />, label: "dining out", category: "Food" },
    
    // Travel
    { id: "traveling", icon: <Plane className="h-5 w-5" />, label: "traveling", category: "Travel" },
    { id: "vacation", icon: <Plane className="h-5 w-5" />, label: "on vacation", category: "Travel" },
    { id: "exploring", icon: <MapPin className="h-5 w-5" />, label: "exploring", category: "Travel" },
    
    // Entertainment
    { id: "gaming", icon: <Gamepad2 className="h-5 w-5" />, label: "playing games", category: "Entertainment" },
    { id: "reading", icon: <Book className="h-5 w-5" />, label: "reading", category: "Entertainment" },
    { id: "watching", icon: <Book className="h-5 w-5" />, label: "watching movies", category: "Entertainment" },
    
    // Fitness
    { id: "working-out", icon: <Heart className="h-5 w-5" />, label: "working out", category: "Fitness" },
    { id: "running", icon: <Heart className="h-5 w-5" />, label: "running", category: "Fitness" },
    { id: "yoga", icon: <Heart className="h-5 w-5" />, label: "doing yoga", category: "Fitness" },
    
    // Work
    { id: "working", icon: <Book className="h-5 w-5" />, label: "working", category: "Work" },
    { id: "studying", icon: <Book className="h-5 w-5" />, label: "studying", category: "Work" },
    { id: "learning", icon: <Book className="h-5 w-5" />, label: "learning something new", category: "Work" },
  ];

  const filteredFeelings = feelings.filter(feeling =>
    feeling.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredActivities = activities.filter(activity =>
    activity.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const feelingCategories = [...new Set(feelings.map(f => f.category))];
  const activityCategories = [...new Set(activities.map(a => a.category))];

  const handleSelect = (type: 'feeling' | 'activity', data: any) => {
    onSelect({ type, data });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full h-[70vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>How are you feeling?</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search feelings or activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="mx-4 mb-4">
            <TabsTrigger value="feelings" className="flex-1">Feelings</TabsTrigger>
            <TabsTrigger value="activities" className="flex-1">Activities</TabsTrigger>
          </TabsList>

          <TabsContent value="feelings" className="flex-1 overflow-y-auto px-4">
            {feelingCategories.map(category => {
              const categoryFeelings = filteredFeelings.filter(f => f.category === category);
              if (categoryFeelings.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{category}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {categoryFeelings.map(feeling => (
                      <button
                        key={feeling.id}
                        onClick={() => handleSelect('feeling', feeling)}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 text-left"
                      >
                        <span className="text-2xl">{feeling.emoji}</span>
                        <span className="text-sm font-medium">{feeling.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="activities" className="flex-1 overflow-y-auto px-4">
            {activityCategories.map(category => {
              const categoryActivities = filteredActivities.filter(a => a.category === category);
              if (categoryActivities.length === 0) return null;

              return (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">{category}</h3>
                  <div className="space-y-2">
                    {categoryActivities.map(activity => (
                      <button
                        key={activity.id}
                        onClick={() => handleSelect('activity', activity)}
                        className="w-full flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 text-left"
                      >
                        <div className="text-blue-500">{activity.icon}</div>
                        <span className="text-sm font-medium">{activity.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FeelingActivityModal;
