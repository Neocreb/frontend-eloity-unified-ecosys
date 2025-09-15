import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Phone,
  PhoneOff,
  Video,
  Users,
  X,
} from "lucide-react";
import { IncomingCall } from "@/hooks/useIncomingCalls";
import { motion, AnimatePresence } from "framer-motion";

interface IncomingCallNotificationProps {
  call: IncomingCall | null;
  onAccept: () => void;
  onDecline: () => void;
  onDismiss?: () => void;
}

export const IncomingCallNotification: React.FC<IncomingCallNotificationProps> = ({
  call,
  onAccept,
  onDecline,
  onDismiss,
}) => {
  const [timeRemaining, setTimeRemaining] = useState(30);

  // Countdown timer
  useEffect(() => {
    if (!call) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onDecline(); // Auto-decline when time runs out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [call, onDecline]);

  // Reset timer when call changes
  useEffect(() => {
    if (call) {
      setTimeRemaining(30);
    }
  }, [call]);

  if (!call) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -100, scale: 0.9 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md mx-4"
      >
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 shadow-2xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="w-12 h-12 border-2 border-white">
                    <AvatarImage src={call.callerAvatar} />
                    <AvatarFallback>
                      {call.callerName.substring(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -top-1 -right-1">
                    {call.type === 'video' ? (
                      <Video className="w-5 h-5 bg-green-500 rounded-full p-1" />
                    ) : (
                      <Phone className="w-5 h-5 bg-blue-500 rounded-full p-1" />
                    )}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">
                      {call.isGroup ? call.groupName : call.callerName}
                    </h3>
                    {call.isGroup && (
                      <Badge variant="secondary" className="bg-white/20 text-white border-0">
                        <Users className="w-3 h-3 mr-1" />
                        Group
                      </Badge>
                    )}
                  </div>
                  <p className="text-blue-100 text-sm">
                    {call.isGroup ? `${call.callerName} is calling` : 'Incoming call'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-xs text-blue-100">
                      {call.type} call • {timeRemaining}s
                    </span>
                  </div>
                </div>
              </div>

              {onDismiss && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismiss}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={onDecline}
                size="lg"
                className="bg-red-500 hover:bg-red-600 rounded-full w-14 h-14 p-0 border-2 border-white"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>

              <Button
                onClick={onAccept}
                size="lg"
                className="bg-green-500 hover:bg-green-600 rounded-full w-14 h-14 p-0 border-2 border-white"
              >
                <Phone className="w-6 h-6" />
              </Button>
            </div>

            {/* Animated ring */}
            <div className="absolute inset-0 rounded-lg">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-400 to-purple-500 opacity-30 animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default IncomingCallNotification;
