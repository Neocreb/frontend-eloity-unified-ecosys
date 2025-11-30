// @ts-nocheck
// src/components/feed/FeelingLocationModal.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smile, MapPin, Search, Navigation, Clock, Map } from "lucide-react";
import {
  FEELINGS,
  ACTIVITIES,
  LOCATION_SUGGESTIONS,
  feedService,
} from "@/services/feedService";
import { useToast } from "@/components/ui/use-toast";
import MapComponent from "@/components/shared/MapComponent";

interface FeelingLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFeelingSelected: (feeling: { emoji: string; text: string }) => void;
  onLocationSelected: (location: {
    name: string;
    coordinates?: { lat: number; lng: number };
  }) => void;
  defaultTab?: "feeling" | "location";
}

export function FeelingLocationModal({
  isOpen,
  onClose,
  onFeelingSelected,
  onLocationSelected,
  defaultTab = "feeling",
}: FeelingLocationModalProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState(LOCATION_SUGGESTIONS);
  const [isSearching, setIsSearching] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const { toast } = useToast();

  // Reset tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setLocationSearch("");
      setLocationResults(LOCATION_SUGGESTIONS);
      setView("list");
    }
  }, [isOpen, defaultTab]);

  // Search locations
  useEffect(() => {
    if (locationSearch.trim()) {
      setIsSearching(true);
      const searchTimeout = setTimeout(async () => {
        try {
          const results = await feedService.searchLocations(locationSearch);
          setLocationResults(results);
        } catch (error) {
          console.error("Location search failed:", error);
        } finally {
          setIsSearching(false);
        }
      }, 300);

      return () => clearTimeout(searchTimeout);
    } else {
      setLocationResults(LOCATION_SUGGESTIONS);
    }
  }, [locationSearch]);

  const handleFeelingSelect = (feeling: { emoji: string; text: string }) => {
    onFeelingSelected(feeling);
    onClose();
  };

  const handleLocationSelect = (location: {
    name: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    onLocationSelected(location);
    onClose();
  };

  const getCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await feedService.getCurrentLocation();
      if (location) {
        handleLocationSelect(location);
      } else {
        toast({
          title: "Location access denied",
          description:
            "Please enable location access or select a location manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Location error",
        description: "Failed to get your current location.",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleMapLocationSelect = (position: [number, number]) => {
    // In a real app, you would reverse geocode the position to get address details
    const location = {
      name: `Selected Location`,
      coordinates: {
        lat: position[0],
        lng: position[1]
      }
    };
    handleLocationSelect(location);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto mx-2 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            {activeTab === "feeling" ? (
              <>
                <Smile className="w-5 h-5" />
                How are you feeling?
              </>
            ) : (
              <>
                <MapPin className="w-5 h-5" />
                Where are you?
              </>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {activeTab === "feeling"
              ? "Let your friends know what you're feeling or doing"
              : "Add your location to this post"}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "feeling" | "location")
          }
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="feeling"
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <Smile className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Feeling</span>
              <span className="xs:hidden">😊</span>
            </TabsTrigger>
            <TabsTrigger
              value="location"
              className="flex items-center gap-1 text-xs sm:text-sm"
            >
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Location</span>
              <span className="xs:hidden">📍</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feeling" className="space-y-4">
            {/* Feelings Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-600">Feelings</h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {FEELINGS.map((feeling, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-2 sm:p-3 hover:bg-blue-50 text-left"
                    onClick={() => handleFeelingSelect(feeling)}
                  >
                    <span className="text-lg sm:text-xl mr-2 flex-shrink-0">
                      {feeling.emoji}
                    </span>
                    <span className="text-xs sm:text-sm truncate">
                      {feeling.text}
                    </span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Activities Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-gray-600">Activities</h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
                {ACTIVITIES.map((activity, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start h-auto p-2 sm:p-3 hover:bg-green-50 text-left"
                    onClick={() => handleFeelingSelect(activity)}
                  >
                    <span className="text-lg sm:text-xl mr-2 flex-shrink-0">
                      {activity.emoji}
                    </span>
                    <span className="text-xs sm:text-sm truncate">
                      {activity.text}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            {/* View Toggle */}
            <div className="flex rounded-lg border">
              <Button
                variant={view === "list" ? "default" : "ghost"}
                className="flex-1 rounded-r-none rounded-l-lg h-10"
                onClick={() => setView("list")}
              >
                List
              </Button>
              <Button
                variant={view === "map" ? "default" : "ghost"}
                className="flex-1 rounded-l-none rounded-r-lg h-10"
                onClick={() => setView("map")}
              >
                <Map className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>

            {view === "list" ? (
              <>
                {/* Current Location */}
                <Button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="w-full justify-start gap-2 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Navigation className="w-4 h-4" />
                  {isGettingLocation
                    ? "Getting location..."
                    : "Use current location"}
                </Button>

                {/* Location Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search for a location"
                    value={locationSearch}
                    onChange={(e) => setLocationSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Location Results */}
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {isSearching ? (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Searching...
                      </div>
                    ) : (
                      <>
                        {locationResults.length > 0 ? (
                          <>
                            {locationResults.map((location, index) => (
                              <Card
                                key={index}
                                className="cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => handleLocationSelect(location)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-sm truncate">
                                        {location.name}
                                      </p>
                                      {location.description && (
                                        <p className="text-xs text-gray-500 truncate">
                                          {location.description}
                                        </p>
                                      )}
                                    </div>
                                    {location.isPopular && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs flex-shrink-0"
                                      >
                                        Popular
                                      </Badge>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </>
                        ) : (
                          <div className="text-center py-4 text-sm text-gray-500">
                            No locations found
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>

                {/* Recent Locations */}
                {locationSearch === "" && (
                  <div className="pt-2">
                    <div className="flex items-center gap-1 mb-2">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Recent locations
                      </span>
                    </div>
                    <div className="space-y-1">
                      {LOCATION_SUGGESTIONS.slice(0, 3).map((location, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          className="w-full justify-start h-auto p-2 text-left"
                          onClick={() => handleLocationSelect(location)}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                            <span className="text-xs text-gray-600 truncate">
                              {location.name}
                            </span>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              // Map View
              <div className="h-96">
                <MapComponent
                  center={[51.505, -0.09]}
                  zoom={13}
                  onLocationSelect={handleMapLocationSelect}
                  height="100%"
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Tap on the map to select a location
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}