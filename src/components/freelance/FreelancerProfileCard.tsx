// @ts-nocheck
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Star,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  MessageCircle,
  Heart,
  CheckCircle,
  Globe,
} from "lucide-react";
import { FreelancerProfile } from "@/types/freelance";

interface FreelancerProfileCardProps {
  freelancer: FreelancerProfile;
  onHire: (freelancer: FreelancerProfile) => void;
  onMessage: (freelancer: FreelancerProfile) => void;
  onSave?: (freelancer: FreelancerProfile) => void;
  showFullBio?: boolean;
}

const FreelancerProfileCard: React.FC<FreelancerProfileCardProps> = ({
  freelancer,
  onHire,
  onMessage,
  onSave,
  showFullBio = false,
}) => {
  const formatEarnings = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`;
    return `$${amount}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white border-gray-200">
      <CardContent className="p-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <Avatar className="h-16 w-16">
              <AvatarImage src={freelancer.avatar} alt={freelancer.name} />
              <AvatarFallback className="text-lg">
                {freelancer.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {freelancer.verified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
            )}
            <div
              className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                freelancer.availability === "available"
                  ? "bg-green-400"
                  : freelancer.availability === "busy"
                    ? "bg-yellow-400"
                    : "bg-gray-400"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {freelancer.name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">{freelancer.title}</p>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{freelancer.location}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Responds {freelancer.responseTime}</span>
                  </div>
                </div>
              </div>

              {onSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSave(freelancer)}
                >
                  <Heart className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">
                {freelancer.rating}
              </span>
            </div>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-1">
              {freelancer.completedJobs}
            </div>
            <p className="text-xs text-gray-600">Jobs</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-1">
              {formatEarnings(freelancer.totalEarned)}
            </div>
            <p className="text-xs text-gray-600">Earned</p>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 mb-1">
              {freelancer.successRate}%
            </div>
            <p className="text-xs text-gray-600">Success</p>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-4">
          <p
            className={`text-gray-700 text-sm leading-relaxed ${
              showFullBio ? "" : "line-clamp-3"
            }`}
          >
            {freelancer.bio}
          </p>
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {freelancer.skills.slice(0, 6).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                {skill}
              </Badge>
            ))}
            {freelancer.skills.length > 6 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{freelancer.skills.length - 6} more
              </Badge>
            )}
          </div>
        </div>

        {/* Languages */}
        {freelancer.languages.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-4 w-4" />
              <span>{freelancer.languages.join(", ")}</span>
            </div>
          </div>
        )}

        {/* Hourly Rate */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-600" />
              <span className="text-lg font-semibold text-gray-900">
                ${freelancer.hourlyRate}/hr
              </span>
            </div>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                freelancer.availability === "available"
                  ? "bg-green-100 text-green-700"
                  : freelancer.availability === "busy"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
              }`}
            >
              {freelancer.availability === "available"
                ? "Available"
                : freelancer.availability === "busy"
                  ? "Busy"
                  : "Unavailable"}
            </div>
          </div>
        </div>

        {/* Portfolio Preview */}
        {freelancer.portfolio.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Recent Work
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {freelancer.portfolio.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="aspect-video bg-gray-100 rounded-lg overflow-hidden"
                >
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onMessage(freelancer)}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button
            onClick={() => onHire(freelancer)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Hire Now
          </Button>
        </div>

        {/* Certifications */}
        {freelancer.certifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Certifications
            </h4>
            <div className="space-y-1">
              {freelancer.certifications.slice(0, 2).map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <CheckCircle className="h-3 w-3 text-green-500" />
                  <span>
                    {cert.name} - {cert.issuer}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FreelancerProfileCard;
