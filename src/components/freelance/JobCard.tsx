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
  Users,
  Briefcase,
  BookmarkPlus,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import { JobPosting } from "@/types/freelance";
import { formatDistanceToNow } from "date-fns";

interface JobCardProps {
  job: JobPosting;
  onApply: (job: JobPosting) => void;
  onSave?: (job: JobPosting) => void;
  onViewDetails: (job: JobPosting) => void;
  showFullDescription?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onApply,
  onSave,
  onViewDetails,
  showFullDescription = false,
}) => {
  const formatBudget = () => {
    if (job.budget.type === "fixed") {
      return `$${job.budget.amount?.toLocaleString()}`;
    } else {
      return `$${job.budget.min}-$${job.budget.max}/hr`;
    }
  };

  const getExperienceLevelColor = (level: string) => {
    switch (level) {
      case "entry":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "expert":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getUrgencyIndicator = () => {
    const deadline = new Date(job.deadline);
    const now = new Date();
    const daysUntilDeadline = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysUntilDeadline <= 3) {
      return { color: "text-red-600", icon: AlertCircle, label: "Urgent" };
    } else if (daysUntilDeadline <= 7) {
      return { color: "text-yellow-600", icon: Clock, label: "Soon" };
    }
    return { color: "text-gray-600", icon: Calendar, label: "Normal" };
  };

  const urgency = getUrgencyIndicator();

  return (
    <Card className="hover:shadow-lg transition-all duration-200 bg-white border-gray-200 hover:border-blue-300">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <h3
                className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer"
                onClick={() => onViewDetails(job)}
              >
                {job.title}
              </h3>
              {onSave && (
                <Button variant="ghost" size="icon" onClick={() => onSave(job)}>
                  <BookmarkPlus className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs">
                {job.category}
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs ${getExperienceLevelColor(job.experienceLevel)}`}
              >
                {job.experienceLevel.charAt(0).toUpperCase() +
                  job.experienceLevel.slice(1)}{" "}
                Level
              </Badge>
              <div
                className={`flex items-center gap-1 text-xs ${urgency.color}`}
              >
                <urgency.icon className="h-3 w-3" />
                <span>{urgency.label}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p
            className={`text-gray-700 text-sm leading-relaxed ${
              showFullDescription ? "" : "line-clamp-3"
            }`}
          >
            {job.description}
          </p>
          {!showFullDescription && job.description.length > 150 && (
            <button
              onClick={() => onViewDetails(job)}
              className="text-blue-600 hover:text-blue-700 text-sm mt-1"
            >
              Read more...
            </button>
          )}
        </div>

        {/* Skills */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 5).map((skill) => (
              <Badge
                key={skill}
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                {skill}
              </Badge>
            ))}
            {job.skills.length > 5 && (
              <Badge variant="outline" className="text-xs text-gray-500">
                +{job.skills.length - 5} more
              </Badge>
            )}
          </div>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {formatBudget()}
              </div>
              <div className="text-xs text-gray-600">
                {job.budget.type === "fixed" ? "Fixed Price" : "Hourly"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-600" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {job.duration}
              </div>
              <div className="text-xs text-gray-600">Duration</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-600" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {job.applicationsCount}
              </div>
              <div className="text-xs text-gray-600">Proposals</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-orange-600" />
            <div>
              <div className="font-semibold text-gray-900 text-sm">
                {new Date(job.deadline).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-600">Deadline</div>
            </div>
          </div>
        </div>

        {/* Client Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage src={job.client.avatar} alt={job.client.name} />
                <AvatarFallback className="text-sm">
                  {job.client.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              {job.client.verified && (
                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-0.5">
                  <CheckCircle className="h-2.5 w-2.5 text-white" />
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900">
                {job.client.name}
              </p>
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span>{job.client.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{job.client.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  <span>{job.client.jobsPosted} jobs posted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              ${job.client.totalSpent.toLocaleString()} spent
            </div>
            <div className="text-xs text-gray-600">
              {job.client.hireRate}% hire rate
            </div>
          </div>
        </div>

        {/* Posted Time */}
        <div className="mb-4">
          <p className="text-xs text-gray-500">
            Posted{" "}
            {formatDistanceToNow(new Date(job.postedDate), { addSuffix: true })}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => onViewDetails(job)}
            variant="outline"
            className="flex-1 border-gray-300 hover:bg-gray-50"
          >
            View Details
          </Button>
          <Button
            onClick={() => onApply(job)}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Apply Now
          </Button>
        </div>

        {/* Attachments indicator */}
        {job.attachments && job.attachments.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Briefcase className="h-4 w-4" />
              <span>
                {job.attachments.length} attachment
                {job.attachments.length > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default JobCard;
